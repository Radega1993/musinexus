import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { toPostResponseShape } from "@/lib/posts";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const profile = await prisma.profile.findUnique({
    where: { handle },
    select: { id: true, isPrivate: true },
  });
  if (!profile) {
    return NextResponse.json(
      { type: "about:blank", title: "Not Found", status: 404 },
      { status: 404, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  if (profile.isPrivate) {
    return NextResponse.json(
      { type: "about:blank", title: "Not Found", status: 404 },
      { status: 404, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = searchParams.get("limit");
  const limit = Math.min(
    Math.max(1, parseInt(rawLimit ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
    MAX_LIMIT
  );
  const cursor = searchParams.get("cursor") ?? undefined;

  const posts = await prisma.post.findMany({
    where: { authorProfileId: profile.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    include: {
      authorProfile: {
        select: { handle: true, displayName: true, avatarUrl: true },
      },
      media: {
        orderBy: { order: "asc" },
        include: {
          mediaAsset: {
            select: { id: true, mimeType: true, key: true },
          },
        },
      },
      _count: {
        select: { likes: true, saves: true, comments: true },
      },
    },
  });

  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;
  const postIds = page.map((p) => p.id);

  let getOverlay: ((postId: string) => { likedByMe: boolean; savedByMe: boolean }) | undefined;
  const session = await getSession();
  if (session?.user?.id && postIds.length > 0) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeProfileId: true },
    });
    const activeProfileId = user?.activeProfileId;
    if (activeProfileId) {
      const [likedRows, savedRows] = await Promise.all([
        prisma.like.findMany({
          where: { profileId: activeProfileId, postId: { in: postIds } },
          select: { postId: true },
        }),
        prisma.save.findMany({
          where: { profileId: activeProfileId, postId: { in: postIds } },
          select: { postId: true },
        }),
      ]);
      const likedPostIds = new Set(likedRows.map((r) => r.postId));
      const savedPostIds = new Set(savedRows.map((r) => r.postId));
      getOverlay = (postId) => ({
        likedByMe: likedPostIds.has(postId),
        savedByMe: savedPostIds.has(postId),
      });
    }
  }

  const shapes = page.map((post) =>
    toPostResponseShape(
      post as Parameters<typeof toPostResponseShape>[0],
      getOverlay ? getOverlay(post.id) : undefined
    )
  );

  return NextResponse.json({
    posts: shapes,
    nextCursor,
  });
}
