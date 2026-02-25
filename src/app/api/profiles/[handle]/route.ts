import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { profileToJson } from "@/lib/profile-response";
import { toPostResponseShape } from "@/lib/posts";

const EMBEDDED_POSTS_LIMIT = 20;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const profile = await prisma.profile.findUnique({
    where: { handle },
    include: {
      _count: {
        select: { followers: true, following: true },
      },
    },
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

  const session = await getSession();
  let activeProfileId: string | null = null;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeProfileId: true },
    });
    activeProfileId = user?.activeProfileId ?? null;
  }

  let isFollowing = false;
  if (activeProfileId && activeProfileId !== profile.id) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerProfileId_followingProfileId: {
          followerProfileId: activeProfileId,
          followingProfileId: profile.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  const posts = await prisma.post.findMany({
    where: { authorProfileId: profile.id },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: EMBEDDED_POSTS_LIMIT,
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

  const postIds = posts.map((p) => p.id);
  let getOverlay: ((postId: string) => { likedByMe: boolean; savedByMe: boolean }) | undefined;
  if (activeProfileId && postIds.length > 0) {
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

  const postsShape = posts.map((post) =>
    toPostResponseShape(
      post as Parameters<typeof toPostResponseShape>[0],
      getOverlay ? getOverlay(post.id) : undefined
    )
  );

  const base = profileToJson(profile);
  return NextResponse.json({
    ...base,
    followerCount: profile._count.followers,
    followingCount: profile._count.following,
    ...(activeProfileId != null && { isFollowing }),
    ...(activeProfileId != null && { isOwnProfile: profile.id === activeProfileId }),
    posts: postsShape,
  });
}
