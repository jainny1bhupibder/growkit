import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireUser } from "@/lib/session";
export async function POST() {
  const u = await requireUser();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const s = await stripe.checkout.sessions.create({
    mode: "subscription", client_reference_id: u.id,
    line_items: [{ price: process.env.STRIPE_PRICE_PRO!, quantity: 1 }],
    subscription_data: { trial_period_days: 7 },
    success_url: process.env.APP_URL + "/?upgraded=1", cancel_url: process.env.APP_URL!,
  });
  return NextResponse.redirect(s.url!, 303);
}
