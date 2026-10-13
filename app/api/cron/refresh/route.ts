import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt, encrypt } from "@/lib/crypto";
import { refreshToken } from "@/lib/instagram";
// Weekly: Instagram tokens last 60 days; refresh any expiring within 20 days.
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Forbidden", { status: 403 });
  const users = await db.user.findMany({ where: { tokenExpires: { lt: new Date(Date.now() + 20 * 864e5) } } });
  let ok = 0;
  for (const u of users) {
    try {
      const t = await refreshToken(decrypt(u.token));
      await db.user.update({ where: { id: u.id }, data: { token: encrypt(t.access_token), tokenExpires: new Date(Date.now() + t.expires_in * 1000) } });
      ok++;
    } catch (e) { console.error("refresh failed", u.id, e); }
  }
  return NextResponse.json({ refreshed: ok });
}
