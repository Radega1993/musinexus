import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { profileToJson } from "@/lib/profile-response";

export async function GET() {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { type: "about:blank", title: "Unauthorized", status: 401 },
      { status: 401, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  const memberships = await prisma.profileMember.findMany({
    where: { userId: session.user.id },
    include: { profile: true },
  });
  const profiles = memberships.map((m) => profileToJson(m.profile));
  return NextResponse.json({ profiles });
}
