import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { draftReply } from "@/lib/ai";
// Returns a DRAFT only. The creator approves before anything is posted.
export async function POST(req: NextRequest) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (u.plan !== "PRO") return NextResponse.json({ error: "AI replies are a Pro feature." }, { status: 402 });
  const { comment } = await req.json();
  if (!comment) return NextResponse.json({ error: "comment required" }, { status: 400 });
  return NextResponse.json({ draft: await draftReply(String(comment), u.voice || "") });
}
