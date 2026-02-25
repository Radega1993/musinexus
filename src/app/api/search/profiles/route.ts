import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const MIN_QUERY_LENGTH = 2;
const SEARCH_LIMIT = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json(
      { profiles: [] },
      { status: 200 }
    );
  }

  const profiles = await prisma.profile.findMany({
    where: {
      isPrivate: false,
      OR: [
        { handle: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
      ],
    },
    take: SEARCH_LIMIT,
    select: {
      id: true,
      handle: true,
      displayName: true,
      avatarUrl: true,
    },
  });

  const profileIds = profiles.map((p) => p.id);
  let activeProfileId: string | null = null;
  let isFollowingSet = new Set<string>();

  const session = await getSession();
  if (session?.user?.id && profileIds.length > 0) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeProfileId: true },
    });
    activeProfileId = user?.activeProfileId ?? null;
    if (activeProfileId) {
      const follows = await prisma.follow.findMany({
        where: {
          followerProfileId: activeProfileId,
          followingProfileId: { in: profileIds },
        },
        select: { followingProfileId: true },
      });
      isFollowingSet = new Set(follows.map((f) => f.followingProfileId));
    }
  }

  const withFollowing = profiles.map((p) => ({
    id: p.id,
    handle: p.handle,
    displayName: p.displayName,
    avatarUrl: p.avatarUrl ?? null,
    ...(activeProfileId != null && { isFollowing: isFollowingSet.has(p.id) }),
  }));

  return NextResponse.json({ profiles: withFollowing });
}
