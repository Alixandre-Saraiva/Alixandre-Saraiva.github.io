"use client";

import { CreditCard, QrCode } from "lucide-react";
import { useState } from "react";
import { cancelSubscription, startCheckout } from "@/actions/subscription";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import type { ActionResult } from "@/lib/types";

export function CheckoutButtons({ renew }: { renew?: boolean }) {
  const [loading, setLoading] = useState<"mercadopago" | "stripe" | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  useActionFeedback(result);

  async function pay(provider: "mercadopago" | "stripe") {
    setLoading(provider);
    const res = await startCheckout(provider);
    setResult(res);
    if (!res.ok || !res.redirectTo?.startsWith("http")) setLoading(null);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Button size="lg" variant="accent" loading={loading === "mercadopago"} disabled={loading !== null} onClick={() => pay("mercadopago")}>
        <QrCode className="size-5" /> {renew ? "Renovar" : "Assinar"} com Mercado Pago
      </Button>
      <Button size="lg" variant="outline" loading={loading === "stripe"} disabled={loading !== null} onClick={() => pay("stripe")}>
        <CreditCard className="size-5" /> Cartão de crédito (Stripe)
      </Button>
    </div>
  );
}

export function CancelSubscriptionButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function confirm() {
    setLoading(true);
    const res = await cancelSubscription();
    setLoading(false);
    setOpen(false);
    toast(res.message ?? "", res.ok ? "success" : "error");
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="text-sm font-medium text-muted underline-offset-4 hover:text-red-500 hover:underline">
        Cancelar renovação automática
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Cancelar renovação?">
        <p className="text-sm text-muted">Seu anúncio continua visível até o fim do período já pago. Depois disso, ele sai das buscas.</p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
            Manter
          </Button>
          <Button variant="danger" className="flex-1" loading={loading} onClick={confirm}>
            Cancelar
          </Button>
        </div>
      </Modal>
    </>
  );
}
