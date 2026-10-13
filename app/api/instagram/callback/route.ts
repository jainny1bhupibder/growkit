import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encrypt } from "@/lib/crypto";
import { setSession } from "@/lib/session";
import { exchangeCode, longLived, getProfile, subscribe } from "@/lib/instagram";
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  if (!code || !state || state !== req.cookies.get("oauth_state")?.value) return new NextResponse("Invalid login request", { status: 400 });
  try {
    const short = await exchangeCode(code.replace(/#_$/, ""));
    const long = await longLived(short.access_token);
    const p = await getProfile(long.access_token);
    const igUserId = String(p.user_id ?? p.id); // professional account id (used in webhooks)
    const data = { igScopedId: String(p.id), username: p.username, token: encrypt(long.access_token), tokenExpires: new Date(Date.now() + long.expires_in * 1000) };
    const user = await db.user.upsert({ where: { igUserId }, create: { igUserId, ...data }, update: data });
    await subscribe(igUserId, long.access_token);
    await setSession(user.id);
    return NextResponse.redirect(new URL("/", process.env.APP_URL));
  } catch (e) {
    console.error(e);
    return new NextResponse("Could not connect Instagram. Make sure it is a Business or Creator account.", { status: 500 });
  }
}
