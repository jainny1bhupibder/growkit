import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "./db";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET!);
export async function setSession(userId: string) {
  const t = await new SignJWT({ uid: userId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("30d").sign(secret());
  cookies().set("session", t, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
}
export async function requireUser() {
  const t = cookies().get("session")?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    return db.user.findUnique({ where: { id: payload.uid as string } });
  } catch { return null; }
}
