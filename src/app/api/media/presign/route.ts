import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getPresignedPutUrl, getBucket } from "@/lib/s3";
import {
  validatePresignRequest,
  buildMediaKey,
  type MediaScope,
} from "@/lib/media-upload";
import { MediaScope as PrismaMediaScope, MediaAssetStatus } from "@/generated/prisma";
import { z } from "zod";

const PRESIGN_TTL_SECONDS = 15 * 60; // 15 min

const BodySchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative(),
  scope: z.enum(["POST_ATTACHMENT", "PROFILE_AVATAR", "GENERIC"]),
});

function problemResponse(problem: { title: string; status: number; detail?: string }) {
  return NextResponse.json(
    {
      type: "about:blank",
      title: problem.title,
      status: problem.status,
      ...(problem.detail && { detail: problem.detail }),
    },
    { status: problem.status, headers: { "Content-Type": "application/problem+json" } }
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

  const body = await request.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return problemResponse({
      title: "Bad Request",
      status: 400,
      detail: parsed.error.message,
    });
  }

  const { filename, contentType, size, scope } = parsed.data;
  const scopeTyped = scope as MediaScope;

  const validation = validatePresignRequest(scopeTyped, contentType, size);
  if (!validation.ok) {
    return problemResponse(validation.problem);
  }

  if (scope === "PROFILE_AVATAR") {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { activeProfileId: true },
    });
    if (!user?.activeProfileId) {
      return problemResponse({
        title: "Bad Request",
        status: 400,
        detail: "PROFILE_AVATAR requires an active profile; set active profile first",
      });
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { activeProfileId: true },
  });
  const profileId =
    scope === "PROFILE_AVATAR" || scope === "POST_ATTACHMENT"
      ? user?.activeProfileId ?? null
      : null;

  const bucket = getBucket();
  const asset = await prisma.mediaAsset.create({
    data: {
      key: "pending", // set below after we have asset id
      bucket,
      mimeType: contentType.trim().toLowerCase(),
      userId: session.user.id,
      profileId,
      scope: scope as unknown as PrismaMediaScope,
      status: MediaAssetStatus.PENDING,
    },
  });

  const key = buildMediaKey(session.user.id, asset.id, filename);
  await prisma.mediaAsset.update({
    where: { id: asset.id },
    data: { key },
  });

  const uploadUrl = await getPresignedPutUrl(key, PRESIGN_TTL_SECONDS);
  const expiresAt = new Date(Date.now() + PRESIGN_TTL_SECONDS * 1000).toISOString();

  return NextResponse.json(
    { assetId: asset.id, key, uploadUrl, expiresAt },
    { status: 201 }
  );
}
