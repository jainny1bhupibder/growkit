import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { requireUser } from "@/lib/session";
import { publicReply, hideComment } from "@/lib/instagram";
// action: "send" (post the approved reply), "hide", or "skip".
export async function POST(req: NextRequest) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { action, commentId, text } = await req.json();
  if (!commentId || !["send", "hide", "skip"].includes(action)) return NextResponse.json({ error: "bad request" }, { status: 400 });
  try {
    const token = decrypt(u.token);
    if (action === "send") {
      const t = String(text || "").trim();
      if (!t || t.length > 2200) return NextResponse.json({ error: "Reply must be 1 to 2200 characters." }, { status: 400 });
      await publicReply(token, String(commentId), t);
    }
    if (action === "hide") await hideComment(token, String(commentId));
    await db.handled.upsert({ where: { commentId: String(commentId) }, create: { commentId: String(commentId), userId: u.id, action }, update: { action } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Instagram rejected that action." }, { status: 502 });
  }
}
