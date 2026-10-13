import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
// Lets a user delete all their data. Also used by the Disconnect button.
export async function POST() {
  const u = await requireUser();
  if (u) await db.user.delete({ where: { id: u.id } });
  const res = NextResponse.redirect(new URL("/", process.env.APP_URL), 303);
  res.cookies.delete("session");
  return res;
}
