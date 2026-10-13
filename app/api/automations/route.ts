import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
async function read(req: NextRequest) {
  const form = !(req.headers.get("content-type") || "").includes("json");
  const b: any = form ? Object.fromEntries(await req.formData()) : await req.json();
  return { b, form };
}
const done = (form: boolean, data: unknown, status = 200) =>
  form ? NextResponse.redirect(new URL("/", process.env.APP_URL), 303) : NextResponse.json(data, { status });

export async function GET() {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json(await db.automation.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" } }));
}
// POST creates; with _method=PATCH toggles active; with _method=DELETE removes (so plain HTML forms work).
export async function POST(req: NextRequest) {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { b, form } = await read(req);
  if (b._method === "DELETE") { await db.automation.deleteMany({ where: { id: b.id, userId: u.id } }); return done(form, { ok: true }); }
  if (b._method === "PATCH") { await db.automation.updateMany({ where: { id: b.id, userId: u.id }, data: { active: b.active === "true" || b.active === true } }); return done(form, { ok: true }); }
  const keyword = String(b.keyword || "").trim(), dm = String(b.dm || "").trim();
  if (!keyword || !dm) return NextResponse.json({ error: "keyword and dm are required" }, { status: 400 });
  if (u.plan === "FREE" && (await db.automation.count({ where: { userId: u.id } })) >= 1)
    return NextResponse.json({ error: "Free plan allows 1 automation. Upgrade to Pro." }, { status: 402 });
  const a = await db.automation.create({ data: { userId: u.id, keyword, dm: dm.slice(0, 900), mediaId: b.mediaId || null, publicReply: b.publicReply || null } });
  return done(form, a, 201);
}
