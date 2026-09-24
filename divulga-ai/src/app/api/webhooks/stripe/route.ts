import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { repo } from "@/lib/data";
import { getStripe, periodEnd } from "@/lib/payments/stripe";

/**
 * Webhook do Stripe. Configure no painel os eventos:
 * invoice.paid e customer.subscription.deleted
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "not configured" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      const ref = invoice.parent?.subscription_details?.subscription;
      if (ref) {
        const subscription = typeof ref === "string" ? await stripe.subscriptions.retrieve(ref) : ref;
        const userId = subscription.metadata.user_id;
        if (userId) {
          await repo.activateSubscription(userId, {
            provider: "stripe",
            providerRef: subscription.id,
            paymentRef: invoice.id,
            valor: invoice.amount_paid / 100,
            vencimento: periodEnd(subscription),
          });
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const userId = event.data.object.metadata.user_id;
      if (userId) await repo.cancelSubscription(userId);
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
