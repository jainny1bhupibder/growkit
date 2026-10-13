import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decrypt } from "@/lib/crypto";
import { requireUser } from "@/lib/session";
import { listMedia, listComments } from "@/lib/instagram";
// Recent comments on your latest 5 posts that you haven't replied to, hidden or skipped.
export async function GET() {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const token = decrypt(u.token);
    const media = await listMedia(u.igUserId, token);
    const lists = await Promise.all(media.map(async (m) => (await listComments(m.id, token)).map((c) => ({ ...c, post: (m.caption || "").slice(0, 60), permalink: m.permalink }))));
    const handled = new Set((await db.handled.findMany({ where: { userId: u.id }, select: { commentId: true } })).map((h) => h.commentId));
    const comments = lists.flat().filter((c) => c.text && c.username !== u.username && !handled.has(c.id))
      .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)).slice(0, 40);
    return NextResponse.json({ comments, plan: u.plan, voice: u.voice || "" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not load comments from Instagram." }, { status: 502 });
  }
}
