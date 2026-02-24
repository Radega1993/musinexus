import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  validateMediaAssetIdsForPost,
  toPostResponseShape,
} from "@/lib/posts";
import { z } from "zod";

const BodySchema = z.object({
  body: z.string().optional(),
  mediaAssetIds: z.array(z.string()).min(1),
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
      detail: "No active profile set; set active profile before creating a post",
    });
  }

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return problemResponse({
      title: "Bad Request",
      status: 400,
      detail: parsed.error.message,
    });
  }

  const { body: caption, mediaAssetIds } = parsed.data;
  const validation = await validateMediaAssetIdsForPost(
    prisma,
    mediaAssetIds,
    activeProfileId
  );
  if (!validation.ok) {
    return problemResponse(validation.problem);
  }

  const post = await prisma.post.create({
    data: {
      authorProfileId: activeProfileId,
      body: caption ?? null,
      media: {
        create: mediaAssetIds.map((mediaAssetId, index) => ({
          mediaAssetId,
          order: index,
        })),
      },
    },
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
    },
  });

  const shape = toPostResponseShape(post as Parameters<typeof toPostResponseShape>[0], {
    likedByMe: false,
    savedByMe: false,
  });
  return NextResponse.json(shape, { status: 201 });
}
