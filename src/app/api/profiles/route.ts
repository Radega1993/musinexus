import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { profileToJson } from "@/lib/profile-response";
import { z } from "zod";
const CreateSchema = z.object({
  type: z.enum(["ARTIST", "GROUP", "INSTITUTION", "LABEL"]),
  handle: z.string().min(3),
  displayName: z.string().min(2),
  bio: z.string().optional(),
  location: z.string().optional(),
  instruments: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { type: "about:blank", title: "Unauthorized", status: 401 },
      { status: 401, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  const body = await request.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { type: "about:blank", title: "Bad Request", status: 400, detail: "Invalid payload" },
      { status: 400, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  const { type, handle, displayName, bio, location, instruments } = parsed.data;
  const existing = await prisma.profile.findUnique({ where: { handle } });
  if (existing) {
    return NextResponse.json(
      { type: "about:blank", title: "Conflict", status: 409, detail: "Handle already exists" },
      { status: 409, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  const profile = await prisma.profile.create({
    data: {
      type,
      handle,
      displayName,
      bio: bio ?? null,
      location: location ?? null,
      instruments: instruments ?? [],
      members: {
        create: { userId: session.user.id, role: "OWNER" },
      },
    },
  });
  return NextResponse.json(profileToJson(profile), { status: 201 });
}
