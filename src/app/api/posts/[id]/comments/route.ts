import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const COMMENT_BODY_MAX_LENGTH = 2000;

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

export async function GET(request: Request, { params }: RouteParams) {
  const { id: postId } = await params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json(
      { type: "about:blank", title: "Not Found", status: 404 },
      { status: 404, headers: { "Content-Type": "application/problem+json" } }
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

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    include: {
      authorProfile: {
        select: { handle: true, displayName: true, avatarUrl: true },
      },
    },
  });

  const hasMore = comments.length > limit;
  const page = hasMore ? comments.slice(0, limit) : comments;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

  const items = page.map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    author: {
      handle: c.authorProfile.handle,
      displayName: c.authorProfile.displayName,
      avatarUrl: c.authorProfile.avatarUrl,
    },
  }));

  return NextResponse.json({
    comments: items,
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

  const { id: postId } = await params;
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) {
    return NextResponse.json(
      { type: "about:blank", title: "Not Found", status: 404 },
      { status: 404, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const body = await request.json().catch(() => ({}));
  const rawBody =
    typeof body?.body === "string" ? body.body.trim() : "";
  if (!rawBody) {
    return problemResponse({
      title: "Bad Request",
      status: 400,
      detail: "body is required and must be a non-empty string",
    });
  }
  if (rawBody.length > COMMENT_BODY_MAX_LENGTH) {
    return problemResponse({
      title: "Bad Request",
      status: 400,
      detail: `body must be at most ${COMMENT_BODY_MAX_LENGTH} characters`,
    });
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorProfileId: activeProfileId,
      body: rawBody,
    },
    include: {
      authorProfile: {
        select: { handle: true, displayName: true, avatarUrl: true },
      },
    },
  });

  return NextResponse.json(
    {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      author: {
        handle: comment.authorProfile.handle,
        displayName: comment.authorProfile.displayName,
        avatarUrl: comment.authorProfile.avatarUrl,
      },
    },
    { status: 201 }
  );
}
