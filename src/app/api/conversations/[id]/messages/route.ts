import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MESSAGE_BODY_MAX_LENGTH = 2000;

type RouteParams = { params: Promise<{ id: string }> };

function problemResponse(problem: {
  title: string;
  status: number;
  detail?: string;
}) {
  return NextResponse.json(
    {
      type: "about:blank",
      title: problem.title,
      status: problem.status,
      ...(problem.detail && { detail: problem.detail }),
    },
    {
      status: problem.status,
      headers: { "Content-Type": "application/problem+json" },
    }
  );
}

async function isBlocked(profileIdA: string, profileIdB: string): Promise<boolean> {
  const block = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerProfileId: profileIdA, blockedProfileId: profileIdB },
        { blockerProfileId: profileIdB, blockedProfileId: profileIdA },
      ],
    },
  });
  return !!block;
}

export async function GET(request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { type: "about:blank", title: "Unauthorized", status: 401 },
      { status: 401, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeProfileId: true },
  });
  const activeProfileId = user?.activeProfileId;
  if (!activeProfileId) {
    return problemResponse({
      title: "Bad Request",
      status: 400,
      detail: "No active profile set; set active profile first",
    });
  }

  const { id: conversationId } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      members: { select: { profileId: true } },
    },
  });
  if (!conversation) {
    return NextResponse.json(
      { type: "about:blank", title: "Not Found", status: 404 },
      { status: 404, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const isMember = conversation.members.some(
    (m) => m.profileId === activeProfileId
  );
  if (!isMember) {
    return NextResponse.json(
      { type: "about:blank", title: "Forbidden", status: 403 },
      { status: 403, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get("limit");
  const limit = Math.min(
    Math.max(
      1,
      parseInt(rawLimit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT
    ),
    MAX_LIMIT
  );
  const cursor = searchParams.get("cursor") ?? undefined;

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    include: {
      authorProfile: {
        select: { id: true, handle: true, displayName: true, avatarUrl: true },
      },
    },
  });

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

  const items = page.map((m) => ({
    id: m.id,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
    author: {
      id: m.authorProfile.id,
      handle: m.authorProfile.handle,
      displayName: m.authorProfile.displayName,
      avatarUrl: m.authorProfile.avatarUrl,
    },
  }));

  return NextResponse.json({
    messages: items,
    nextCursor,
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { type: "about:blank", title: "Unauthorized", status: 401 },
      { status: 401, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeProfileId: true },
  });
  const activeProfileId = user?.activeProfileId;
  if (!activeProfileId) {
    return problemResponse({
      title: "Bad Request",
      status: 400,
      detail: "No active profile set; set active profile first",
    });
  }

  const { id: conversationId } = await params;
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      members: { select: { profileId: true } },
    },
  });
  if (!conversation) {
    return NextResponse.json(
      { type: "about:blank", title: "Not Found", status: 404 },
      { status: 404, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const isMember = conversation.members.some(
    (m) => m.profileId === activeProfileId
  );
  if (!isMember) {
    return NextResponse.json(
      { type: "about:blank", title: "Forbidden", status: 403 },
      { status: 403, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const otherProfileId = conversation.members.find(
    (m) => m.profileId !== activeProfileId
  )?.profileId;
  if (otherProfileId) {
    const blocked = await isBlocked(activeProfileId, otherProfileId);
    if (blocked) {
      return NextResponse.json(
        { type: "about:blank", title: "Forbidden", status: 403 },
        { status: 403, headers: { "Content-Type": "application/problem+json" } }
      );
    }
  }

  const body = await request.json().catch(() => ({}));
  const rawBody = typeof body?.body === "string" ? body.body.trim() : "";
  if (!rawBody) {
    return problemResponse({
      title: "Bad Request",
      status: 400,
      detail: "body is required and must be a non-empty string",
    });
  }
  if (rawBody.length > MESSAGE_BODY_MAX_LENGTH) {
    return problemResponse({
      title: "Bad Request",
      status: 400,
      detail: `body must be at most ${MESSAGE_BODY_MAX_LENGTH} characters`,
    });
  }

  const now = new Date();
  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationId,
        authorProfileId: activeProfileId,
        body: rawBody,
      },
      include: {
        authorProfile: {
          select: { id: true, handle: true, displayName: true, avatarUrl: true },
        },
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: now },
    }),
  ]);

  return NextResponse.json(
    {
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      author: {
        id: message.authorProfile.id,
        handle: message.authorProfile.handle,
        displayName: message.authorProfile.displayName,
        avatarUrl: message.authorProfile.avatarUrl,
      },
    },
    { status: 201 }
  );
}
