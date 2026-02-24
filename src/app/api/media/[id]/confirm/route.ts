import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { headObject } from "@/lib/s3";
import { MediaAssetStatus } from "@/generated/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: RouteParams) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { type: "about:blank", title: "Unauthorized", status: 401 },
      { status: 401, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const { id } = await params;
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
  });

  if (!asset) {
    return NextResponse.json(
      { type: "about:blank", title: "Not Found", status: 404 },
      { status: 404, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  if (asset.userId !== session.user.id) {
    return NextResponse.json(
      { type: "about:blank", title: "Forbidden", status: 403, detail: "Not owner of this asset" },
      { status: 403, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  if (asset.status === MediaAssetStatus.READY) {
    return new NextResponse(null, { status: 204 });
  }

  const head = await headObject(asset.key);
  if (!head) {
    return NextResponse.json(
      {
        type: "about:blank",
        title: "Conflict",
        status: 409,
        detail: "Object not found in storage; upload may not be completed",
      },
      { status: 409, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const size = head.ContentLength ?? undefined;
  await prisma.mediaAsset.update({
    where: { id },
    data: { status: MediaAssetStatus.READY, ...(size != null && { size }) },
  });

  return new NextResponse(null, { status: 204 });
}
