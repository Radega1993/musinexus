import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { profileToJson } from "@/lib/profile-response";
import { z } from "zod";

const PostBodySchema = z.object({
  otherParticipantProfileId: z.string().min(1),
});

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

async function isBlocked(
  profileIdA: string,
  profileIdB: string
): Promise<boolean> {
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

export async function POST(request: Request) {
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

  const body = await request.json().catch(() => ({}));
  const parsed = PostBodySchema.safeParse(body);
  if (!parsed.success) {
    return problemResponse({
      title: "Bad Request",
      status: 400,
      detail: "otherParticipantProfileId is required",
    });
  }
  const { otherParticipantProfileId } = parsed.data;

  if (otherParticipantProfileId === activeProfileId) {
    return problemResponse({
      title: "Bad Request",
      status: 400,
      detail: "Cannot start a conversation with yourself",
    });
  }

  const otherProfile = await prisma.profile.findUnique({
    where: { id: otherParticipantProfileId },
    select: { id: true },
  });
  if (!otherProfile) {
    return NextResponse.json(
      { type: "about:blank", title: "Not Found", status: 404 },
      { status: 404, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const blocked = await isBlocked(activeProfileId, otherParticipantProfileId);
  if (blocked) {
    return NextResponse.json(
      { type: "about:blank", title: "Forbidden", status: 403 },
      { status: 403, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const candidates = await prisma.conversation.findMany({
    where: {
      members: {
        some: { profileId: activeProfileId },
      },
    },
    include: {
      members: {
        select: { profileId: true },
        include: {
          profile: {
            select: { id: true, handle: true, displayName: true, avatarUrl: true },
          },
        },
      },
    },
  });
  const existing = candidates.find(
    (c) =>
      c.members.length === 2 &&
      c.members.some((m) => m.profileId === otherParticipantProfileId)
  );

  if (existing) {
    const otherMember = existing.members.find(
      (m) => m.profileId !== activeProfileId
    );
    const lastMessage = await prisma.message.findFirst({
      where: { conversationId: existing.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, body: true, createdAt: true },
    });
    return NextResponse.json(
      {
        id: existing.id,
        createdAt: existing.createdAt.toISOString(),
        lastMessageAt: existing.lastMessageAt?.toISOString() ?? null,
        otherParticipant: otherMember
          ? profileToJson(otherMember.profile as Parameters<typeof profileToJson>[0])
          : null,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              body: lastMessage.body,
              createdAt: lastMessage.createdAt.toISOString(),
            }
          : null,
      },
      { status: 200 }
    );
  }

  const conversation = await prisma.conversation.create({
    data: {
      members: {
        create: [
          { profileId: activeProfileId },
          { profileId: otherParticipantProfileId },
        ],
      },
    },
    include: {
      members: {
        include: {
          profile: {
            select: { id: true, handle: true, displayName: true, avatarUrl: true },
          },
        },
      },
    },
  });

  const otherMember = conversation.members.find(
    (m) => m.profileId !== activeProfileId
  );
  return NextResponse.json(
    {
      id: conversation.id,
      createdAt: conversation.createdAt.toISOString(),
      lastMessageAt: conversation.lastMessageAt?.toISOString() ?? null,
      otherParticipant: otherMember
        ? profileToJson(otherMember.profile as Parameters<typeof profileToJson>[0])
        : null,
      lastMessage: null,
    },
    { status: 201 }
  );
}

export async function GET(request: Request) {
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

  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: { profileId: activeProfileId },
      },
    },
    orderBy: { lastMessageAt: "desc" },
    include: {
      members: {
        where: { profileId: { not: activeProfileId } },
        include: {
          profile: {
            select: { id: true, handle: true, displayName: true, avatarUrl: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, body: true, createdAt: true },
      },
    },
  });

  const items = conversations.map((c) => {
    const otherMember = c.members[0];
    const lastMsg = c.messages[0];
    return {
      id: c.id,
      createdAt: c.createdAt.toISOString(),
      lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
      otherParticipant: otherMember
        ? profileToJson(otherMember.profile as Parameters<typeof profileToJson>[0])
        : null,
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            body: lastMsg.body,
            createdAt: lastMsg.createdAt.toISOString(),
          }
        : null,
    };
  });

  return NextResponse.json({ conversations: items });
}
