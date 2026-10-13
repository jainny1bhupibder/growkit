import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
export async function POST(req: NextRequest) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { voice } = await req.json();
  await db.user.update({ where: { id: u.id }, data: { voice: String(voice || "").slice(0, 500) } });
  return NextResponse.json({ ok: true });
}
