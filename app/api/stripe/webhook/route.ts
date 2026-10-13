import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  let ev: Stripe.Event;
  try { ev = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature")!, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch { return new NextResponse("Bad signature", { status: 400 }); }
  if (ev.type === "checkout.session.completed") {
    const s = ev.data.object as Stripe.Checkout.Session;
    if (s.client_reference_id) await db.user.update({ where: { id: s.client_reference_id }, data: { plan: "PRO", stripeCustomerId: String(s.customer) } });
  }
  if (ev.type === "customer.subscription.deleted") {
    const sub = ev.data.object as Stripe.Subscription;
    await db.user.updateMany({ where: { stripeCustomerId: String(sub.customer) }, data: { plan: "FREE" } });
  }
  return NextResponse.json({ received: true });
}
