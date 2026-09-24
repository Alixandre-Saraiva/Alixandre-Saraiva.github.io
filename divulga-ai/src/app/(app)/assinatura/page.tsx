import { BadgeCheck, CheckCircle2, PartyPopper, Receipt, XCircle } from "lucide-react";
import type { Metadata } from "next";
import { CancelSubscriptionButton, CheckoutButtons } from "@/components/subscription/checkout-buttons";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth";
import { repo } from "@/lib/data";
import { isDemoMode } from "@/lib/env";
import type { SubscriptionStatus } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Assinatura", robots: { index: false } };

const STATUS: Record<SubscriptionStatus, { label: string; tone: "success" | "accent" | "danger" | "neutral" }> = {
  ativa: { label: "Ativa", tone: "success" },
  pendente: { label: "Aguardando pagamento", tone: "accent" },
  vencida: { label: "Vencida", tone: "danger" },
  cancelada: { label: "Cancelada", tone: "neutral" },
};

const BENEFITS = [
  "Perfil visível nas buscas da sua cidade",
  "Botão direto para o seu WhatsApp",
  "Avaliações de clientes e nota média",
  "Estatísticas de visualizações",
  "Cancele quando quiser, sem multa",
];

const PROVIDERS = { stripe: "Stripe", mercadopago: "Mercado Pago", demo: "Demonstração" };

export default async function SubscriptionPage({ searchParams }: PageProps<"/assinatura">) {
  const user = await requireRole("profissional", "/assinatura");
  const [sp, subscription, payments] = await Promise.all([searchParams, repo.getSubscription(user.id), repo.listPayments(user.id)]);
  const active = subscription?.status === "ativa";
  const status = subscription ? STATUS[subscription.status] : { label: "Sem assinatura", tone: "neutral" as const };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Assinatura</h1>

      {sp.bemvindo && (
        <Notice icon={<PartyPopper className="size-5" />} tone="primary">
          Conta criada! Ative seu plano para começar a aparecer para clientes.
        </Notice>
      )}
      {sp.status === "sucesso" && (
        <Notice icon={<CheckCircle2 className="size-5" />} tone="success">
          Pagamento recebido! {isDemoMode ? "Seu anúncio já está no ar." : "Assim que o provedor confirmar, seu anúncio entra no ar."}
        </Notice>
      )}
      {sp.status === "cancelado" && (
        <Notice icon={<XCircle className="size-5" />} tone="danger">
          O pagamento não foi concluído. Você pode tentar novamente quando quiser.
        </Notice>
      )}

      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-br from-primary to-primary-700 p-6 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-white/80">Plano Profissional</p>
              <p className="mt-1 text-4xl font-semibold">
                R$ 5,00<span className="text-base font-normal text-white/70">/mês</span>
              </p>
            </div>
            <Badge tone={status.tone} className="bg-white/95">
              {status.label}
            </Badge>
          </div>
          {subscription?.vencimento && (
            <p className="mt-3 text-sm text-white/85">
              {active ? (subscription.renovacao_automatica ? "Próxima renovação" : "Ativo até") : "Venceu em"} {formatDate(subscription.vencimento)}
              {subscription.provider && ` · ${PROVIDERS[subscription.provider]}`}
            </p>
          )}
        </div>
        <div className="space-y-6 p-6">
          <ul className="grid gap-2 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm">
                <BadgeCheck className="size-5 shrink-0 text-primary" /> {b}
              </li>
            ))}
          </ul>
          {active && subscription?.renovacao_automatica ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-2 p-4">
              <p className="text-sm">Renovação automática ativa. Você não precisa fazer nada.</p>
              <CancelSubscriptionButton />
            </div>
          ) : (
            <div className="space-y-3">
              <CheckoutButtons renew={Boolean(subscription)} />
              <p className="text-center text-xs text-muted">
                Pix, boleto ou cartão pelo Mercado Pago · cartão internacional pelo Stripe. Cobrança mensal automática.
                {isDemoMode && " No modo demonstração o pagamento é simulado."}
              </p>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Área financeira" />
        {payments.length === 0 ? (
          <p className="text-sm text-muted">Nenhum pagamento ainda.</p>
        ) : (
          <ul className="divide-y divide-line">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary dark:bg-primary-900/50">
                  <Receipt className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Mensalidade · {PROVIDERS[p.provider] ?? p.provider}</p>
                  <p className="text-xs text-muted">{formatDate(p.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(p.valor)}</p>
                  <p className="text-xs capitalize text-emerald-600">{p.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function Notice({ icon, tone, children }: { icon: React.ReactNode; tone: "primary" | "success" | "danger"; children: React.ReactNode }) {
  const tones = {
    primary: "bg-primary-50 text-primary-800 dark:bg-primary-900/40 dark:text-primary-100",
    success: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
    danger: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200",
  };
  return <div className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-medium ${tones[tone]}`}>{icon}{children}</div>;
}
