import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "change-this-secret");

export interface AuthPayload {
  userId: number;
  username: string;
}

export async function signToken(userId: number, username: string): Promise<string> {
  return new SignJWT({ userId, username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as AuthPayload;
}

export async function getAuthUser(request: Request): Promise<AuthPayload | null> {
  const header = request.headers.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}
