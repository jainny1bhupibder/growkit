import { NextResponse } from "next/server";
import crypto from "crypto";
import { authUrl } from "@/lib/instagram";
export async function GET() {
  const state = crypto.randomBytes(16).toString("hex");
  const res = NextResponse.redirect(authUrl(state));
  res.cookies.set("oauth_state", state, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
