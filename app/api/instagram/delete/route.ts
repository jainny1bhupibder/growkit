import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
// Meta "Data deletion request URL": receives a signed_request when someone removes the app.
export async function POST(req: NextRequest) {
  const sr = String((await req.formData()).get("signed_request") || "");
  const [sig, payload] = sr.split(".");
  const exp = crypto.createHmac("sha256", process.env.IG_APP_SECRET!).update(payload || "").digest("base64url");
  if (!sig || sig !== exp) return new NextResponse("Bad signature", { status: 400 });
  const { user_id } = JSON.parse(Buffer.from(payload, "base64url").toString());
  await db.user.deleteMany({ where: { OR: [{ igUserId: String(user_id) }, { igScopedId: String(user_id) }] } });
  return NextResponse.json({ url: process.env.APP_URL + "/privacy", confirmation_code: crypto.randomUUID() });
}
