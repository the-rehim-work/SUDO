import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/leaderboard",
];

const PROTECTED_PREFIXES = ["/api/game", "/api/statistics", "/api/auth/me"];

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url);
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isPublic = PUBLIC_PATHS.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected || isPublic) return NextResponse.next();

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "change-this-secret");
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
