import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  return NextResponse.json({ user: { id: user.userId, username: user.username } });
}
