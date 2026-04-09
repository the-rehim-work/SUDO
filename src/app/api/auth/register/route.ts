import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as { username?: string; password?: string };
  if (!username || !password) {
    return NextResponse.json({ error: "Username and password required" }, { status: 400 });
  }
  if (username.length < 3 || password.length < 4) {
    return NextResponse.json({ error: "Username must be 3+ chars, password 4+ chars" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return NextResponse.json({ error: "Username already exists" }, { status: 400 });

  const user = await prisma.user.create({
    data: { username, passwordHash: await bcrypt.hash(password, 10) },
    select: { id: true, username: true },
  });

  return NextResponse.json({ token: signToken(user.id, user.username), user });
}
