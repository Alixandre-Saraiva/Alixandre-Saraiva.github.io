import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY não configurada");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/** Fim do período atual (o campo fica nos itens nas versões recentes da API). */
export function periodEnd(subscription: Stripe.Subscription) {
  const seconds = subscription.items.data[0]?.current_period_end;
  return seconds ? new Date(seconds * 1000) : new Date(Date.now() + 31 * 86_400_000);
}
