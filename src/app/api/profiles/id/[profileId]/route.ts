import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { profileToJson } from "@/lib/profile-response";
import { z } from "zod";

const UpdateSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().optional(),
  avatarUrl: z.string().optional(),
  location: z.string().optional(),
  links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  instruments: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ profileId: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { type: "about:blank", title: "Unauthorized", status: 401 },
      { status: 401, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  const { profileId } = await params;
  const membership = await prisma.profileMember.findUnique({
    where: { userId_profileId: { userId: session.user.id, profileId } },
  });
  if (!membership) {
    return NextResponse.json(
      { type: "about:blank", title: "Forbidden", status: 403 },
      { status: 403, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  if (membership.role !== "OWNER" && membership.role !== "ADMIN") {
    return NextResponse.json(
      { type: "about:blank", title: "Forbidden", status: 403 },
      { status: 403, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  const body = await request.json().catch(() => ({}));
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { type: "about:blank", title: "Bad Request", status: 400 },
      { status: 400, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  const data = parsed.data;
  const profile = await prisma.profile.update({
    where: { id: profileId },
    data: {
      ...(data.displayName !== undefined && { displayName: data.displayName }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
      ...(data.location !== undefined && { location: data.location }),
      ...(data.links !== undefined && { links: data.links }),
      ...(data.instruments !== undefined && { instruments: data.instruments }),
      ...(data.isPrivate !== undefined && { isPrivate: data.isPrivate }),
    },
  });
  return NextResponse.json(profileToJson(profile));
}
