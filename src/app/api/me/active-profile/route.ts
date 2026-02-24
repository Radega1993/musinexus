import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BodySchema = z.object({ profileId: z.string() });

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
    return NextResponse.json(
      { type: "about:blank", title: "Bad Request", status: 400 },
      { status: 400, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  const { profileId } = parsed.data;
  const membership = await prisma.profileMember.findUnique({
    where: { userId_profileId: { userId: session.user.id, profileId } },
  });
  if (!membership) {
    return NextResponse.json(
      { type: "about:blank", title: "Forbidden", status: 403, detail: "Not a member of that profile" },
      { status: 403, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { activeProfileId: profileId },
  });
  return new NextResponse(null, { status: 204 });
}
