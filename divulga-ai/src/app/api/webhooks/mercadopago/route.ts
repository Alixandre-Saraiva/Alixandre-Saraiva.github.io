import { NextResponse, type NextRequest } from "next/server";
import { WebhookSignatureValidator } from "mercadopago";
import { repo } from "@/lib/data";
import { mpPreApproval } from "@/lib/payments/mercadopago";

interface Notification {
  type?: string;
  action?: string;
  data?: { id?: string };
}

function addMonth(from = new Date()) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 1);
  return d;
}

/**
 * Webhook do Mercado Pago (assinaturas / preapproval). Configure no painel os
 * tópicos "Planos e assinaturas" apontando para /api/webhooks/mercadopago.
 */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Notification;
  const dataId = body.data?.id ?? request.nextUrl.searchParams.get("data.id");
  if (!dataId) return NextResponse.json({ ignored: true });

  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  if (secret) {
    try {
      WebhookSignatureValidator.validate({
        xSignature: request.headers.get("x-signature"),
        xRequestId: request.headers.get("x-request-id"),
        dataId,
        secret,
      });
    } catch {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
  }

  try {
    if (body.type === "subscription_preapproval") {
      const pre = await mpPreApproval().get({ id: dataId });
      const userId = pre.external_reference;
      if (userId && pre.status === "authorized") {
        await repo.activateSubscription(userId, {
          provider: "mercadopago",
          providerRef: pre.id ?? dataId,
          paymentRef: `mp-pre-${pre.id}-${pre.summarized?.charged_quantity ?? 0}`,
          valor: pre.auto_recurring?.transaction_amount ?? 5,
          vencimento: pre.next_payment_date ? new Date(pre.next_payment_date) : addMonth(),
        });
      } else if (userId && (pre.status === "cancelled" || pre.status === "paused")) {
        await repo.cancelSubscription(userId);
      }
    }

    if (body.type === "subscription_authorized_payment") {
      // Cobrança recorrente processada: renova por mais um mês.
      const res = await fetch(`https://api.mercadopago.com/authorized_payments/${dataId}`, {
        headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
      });
      if (res.ok) {
        const payment = (await res.json()) as {
          preapproval_id?: string;
          transaction_amount?: number;
          payment?: { id?: number; status?: string };
        };
        if (payment.preapproval_id && payment.payment?.status === "approved") {
          const pre = await mpPreApproval().get({ id: payment.preapproval_id });
          if (pre.external_reference) {
            await repo.activateSubscription(pre.external_reference, {
              provider: "mercadopago",
              providerRef: payment.preapproval_id,
              paymentRef: `mp-${payment.payment.id ?? dataId}`,
              valor: payment.transaction_amount ?? 5,
              vencimento: pre.next_payment_date ? new Date(pre.next_payment_date) : addMonth(),
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("[mercadopago webhook]", e);
    return NextResponse.json({ error: "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
