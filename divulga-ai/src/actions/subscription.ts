"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCurrentUser, repo } from "@/lib/data";
import { isMercadoPagoEnabled, isStripeEnabled, isSupabaseEnabled, SITE_URL, SUBSCRIPTION_PRICE } from "@/lib/env";
import { mpPreApproval } from "@/lib/payments/mercadopago";
import { getStripe } from "@/lib/payments/stripe";
import type { ActionResult, PaymentProvider } from "@/lib/types";

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return host ? `${h.get("x-forwarded-proto") ?? "https"}://${host}` : SITE_URL;
}

/**
 * Inicia o pagamento da assinatura mensal. Retorna a URL do checkout do
 * provedor; sem credenciais configuradas, simula o pagamento (modo demo).
 */
export async function startCheckout(provider: Exclude<PaymentProvider, "demo">): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Entre na sua conta para assinar." };
  if (user.tipo !== "profissional") return { ok: false, message: "A assinatura é exclusiva para profissionais." };

  const base = await origin();
  const providerReady = provider === "stripe" ? isStripeEnabled : isMercadoPagoEnabled;

  if (!providerReady) {
    if (isSupabaseEnabled) return { ok: false, message: "Este meio de pagamento ainda não foi configurado." };
    // Modo demonstração: aprova na hora.
    await repo.activateSubscription(user.id, {
      provider: "demo",
      providerRef: null,
      paymentRef: `demo-${Date.now()}`,
      valor: SUBSCRIPTION_PRICE,
      vencimento: new Date(Date.now() + 30 * 86_400_000),
    });
    revalidatePath("/", "layout");
    return { ok: true, message: "Pagamento simulado aprovado!", redirectTo: "/assinatura?status=sucesso" };
  }

  try {
    if (provider === "stripe") {
      const priceId = process.env.STRIPE_PRICE_ID;
      const session = await getStripe().checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email,
        client_reference_id: user.id,
        metadata: { user_id: user.id },
        subscription_data: { metadata: { user_id: user.id } },
        line_items: [
          priceId
            ? { price: priceId, quantity: 1 }
            : {
                quantity: 1,
                price_data: {
                  currency: "brl",
                  unit_amount: SUBSCRIPTION_PRICE * 100,
                  recurring: { interval: "month" },
                  product_data: { name: "Divulga ai — Plano Profissional" },
                },
              },
        ],
        locale: "pt-BR",
        success_url: `${base}/assinatura?status=sucesso`,
        cancel_url: `${base}/assinatura?status=cancelado`,
      });
      return { ok: true, redirectTo: session.url ?? undefined };
    }

    const preapproval = await mpPreApproval().create({
      body: {
        reason: "Divulga ai — Plano Profissional",
        external_reference: user.id,
        payer_email: user.email,
        back_url: `${base}/assinatura?status=sucesso`,
        status: "pending",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: SUBSCRIPTION_PRICE,
          currency_id: "BRL",
        },
      },
    });
    return { ok: true, redirectTo: preapproval.init_point };
  } catch (e) {
    console.error("[checkout]", e);
    return { ok: false, message: "Não foi possível iniciar o pagamento. Tente novamente." };
  }
}

/** Desliga a renovação automática. O anúncio segue ativo até o vencimento. */
export async function cancelSubscription(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Faça login novamente." };
  const sub = await repo.getSubscription(user.id);
  if (!sub || sub.status !== "ativa") return { ok: false, message: "Você não tem uma assinatura ativa." };

  try {
    if (sub.provider === "stripe" && sub.provider_ref && isStripeEnabled) {
      await getStripe().subscriptions.update(sub.provider_ref, { cancel_at_period_end: true });
    } else if (sub.provider === "mercadopago" && sub.provider_ref && isMercadoPagoEnabled) {
      await mpPreApproval().update({ id: sub.provider_ref, body: { status: "cancelled" } });
    }
    await repo.cancelSubscription(user.id);
  } catch (e) {
    console.error("[cancel]", e);
    return { ok: false, message: "Não foi possível cancelar agora. Tente novamente." };
  }
  revalidatePath("/assinatura");
  return { ok: true, message: "Renovação automática cancelada." };
}
