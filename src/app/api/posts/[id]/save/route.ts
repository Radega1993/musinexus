import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

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

export async function POST(_request: Request, { params }: RouteParams) {
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

  const existing = await prisma.save.findUnique({
    where: { postId_profileId: { postId, profileId: activeProfileId } },
  });
  if (existing) {
    return new NextResponse(null, { status: 204 });
  }

  await prisma.save.create({
    data: { postId, profileId: activeProfileId },
  });
  return new NextResponse(null, { status: 201 });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
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

  await prisma.save.deleteMany({
    where: { postId, profileId: activeProfileId },
  });
  return new NextResponse(null, { status: 204 });
}
