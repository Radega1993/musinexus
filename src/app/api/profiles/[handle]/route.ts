import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { profileToJson } from "@/lib/profile-response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  const profile = await prisma.profile.findUnique({
    where: { handle },
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
  return NextResponse.json(profileToJson(profile));
}
