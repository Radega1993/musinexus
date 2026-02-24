import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.1",
        title: "Bad Request",
        status: 400,
        detail: "Invalid payload",
      },
      { status: 400, headers: { "Content-Type": "application/problem+json" } }
    );
  }
  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      {
        type: "https://tools.ietf.org/html/rfc7231#section-6.5.8",
        title: "Conflict",
        status: 409,
        detail: "Email already exists",
      },
      { status: 409, headers: { "Content-Type": "application/problem+json" } }
    );
  }

  const passwordHash = await hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash },
  });
  return NextResponse.json({ userId: user.id }, { status: 201 });
}
