import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { privateReply, publicReply } from "@/lib/instagram";

// Meta calls this once to verify your webhook URL.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  if (q.get("hub.mode") === "subscribe" && q.get("hub.verify_token") === process.env.IG_WEBHOOK_VERIFY_TOKEN) return new NextResponse(q.get("hub.challenge"));
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const sig = req.headers.get("x-hub-signature-256") || "";
  const exp = "sha256=" + crypto.createHmac("sha256", process.env.IG_APP_SECRET!).update(raw).digest("hex");
  if (sig.length !== exp.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(exp))) return new NextResponse("Bad signature", { status: 401 });

  const body = JSON.parse(raw);
  for (const entry of body.entry ?? []) {
    const user = await db.user.findUnique({ where: { igUserId: String(entry.id) }, include: { automations: { where: { active: true } } } });
    if (!user) continue;
    const token = decrypt(user.token);
    for (const ch of entry.changes ?? []) {
      const v = ch.value;
      if (ch.field !== "comments" || !v?.id || !v.text || String(v.from?.id) === String(entry.id)) continue; // ignore own comments (no loops)
      const text = String(v.text).toUpperCase();
      const a = user.automations.find((x) => text.includes(x.keyword.toUpperCase()) && (!x.mediaId || x.mediaId === v.media?.id));
      if (!a) continue;
      try { await db.dmLog.create({ data: { automationId: a.id, commentId: v.id, fromId: String(v.from.id) } }); } catch { continue; } // already handled
      try {
        await privateReply(user.igUserId, token, v.id, a.dm);
        if (a.publicReply) await publicReply(token, v.id, a.publicReply).catch(() => {});
        await db.automation.update({ where: { id: a.id }, data: { sent: { increment: 1 } } });
      } catch (e) {
        console.error("DM failed", e);
        await db.dmLog.delete({ where: { commentId: v.id } }).catch(() => {});
      }
    }
  }
  return NextResponse.json({ ok: true });
}
