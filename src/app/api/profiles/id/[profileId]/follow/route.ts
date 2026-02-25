import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function problem(status: number, title: string, detail?: string) {
  return NextResponse.json(
    { type: "about:blank", title, status, ...(detail && { detail }) },
    { status, headers: { "Content-Type": "application/problem+json" } }
  );
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return problem(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeProfileId: true },
  });
  const activeProfileId = user?.activeProfileId;
  if (!activeProfileId) {
    return problem(400, "Bad Request", "No active profile");
  }

  const { profileId: followingProfileId } = await params;
  if (followingProfileId === activeProfileId) {
    return problem(403, "Forbidden", "Cannot follow yourself");
  }

  const profile = await prisma.profile.findUnique({
    where: { id: followingProfileId },
    select: { id: true },
  });
  if (!profile) {
    return problem(404, "Not Found");
  }

  await prisma.follow.upsert({
    where: {
      followerProfileId_followingProfileId: {
        followerProfileId: activeProfileId,
        followingProfileId,
      },
    },
    create: {
      followerProfileId: activeProfileId,
      followingProfileId,
    },
    update: {},
  });

  return NextResponse.json(
    { isFollowing: true },
    { status: 201 }
  );
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return problem(401, "Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeProfileId: true },
  });
  const activeProfileId = user?.activeProfileId;
  if (!activeProfileId) {
    return problem(400, "Bad Request", "No active profile");
  }

  const { profileId: followingProfileId } = await params;
  const profile = await prisma.profile.findUnique({
    where: { id: followingProfileId },
    select: { id: true },
  });
  if (!profile) {
    return problem(404, "Not Found");
  }

  await prisma.follow.deleteMany({
    where: {
      followerProfileId: activeProfileId,
      followingProfileId,
    },
  });

  return NextResponse.json({ isFollowing: false }, { status: 200 });
}
