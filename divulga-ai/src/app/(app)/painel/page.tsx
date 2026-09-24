import { AlertTriangle, CalendarClock, ExternalLink, Eye, MessageSquare, Star } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AvatarUploader } from "@/components/dashboard/avatar-uploader";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { ServicesManager } from "@/components/dashboard/services-manager";
import { StatCard } from "@/components/dashboard/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, SectionTitle } from "@/components/ui/card";
import { Stars } from "@/components/ui/stars";
import { requireRole } from "@/lib/auth";
import { repo } from "@/lib/data";
import { formatDate, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Meu painel", robots: { index: false } };

export default async function DashboardPage() {
  const user = await requireRole("profissional", "/painel");
  const [pro, categories, services, stats, subscription, reviews] = await Promise.all([
    repo.getProfessionalRecord(user.id),
    repo.listCategories(),
    repo.listServices(user.id),
    repo.getDashboardStats(user.id),
    repo.getSubscription(user.id),
    repo.listReviews(user.id, 5),
  ]);

  if (!pro) {
    return <p className="text-muted">Perfil profissional não encontrado. Fale com o suporte.</p>;
  }

  const active = subscription?.status === "ativa";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Olá, {user.nome.split(" ")[0]} 👋</p>
          <h1 className="text-2xl font-semibold tracking-tight">Meu painel</h1>
        </div>
        <ButtonLink href={`/profissional/${user.id}`} variant="outline" size="sm">
          <ExternalLink className="size-4" /> Ver perfil público
        </ButtonLink>
      </header>

      {(!active || !pro.aprovado) && (
        <div className="flex items-start gap-3 rounded-2xl border border-accent/50 bg-accent-100 p-4 text-sm text-[#5c4708] dark:bg-accent-700/15 dark:text-accent-300">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div className="flex-1">
            {!active ? (
              <>
                <p className="font-semibold">Seu anúncio está oculto</p>
                <p>Ative a assinatura de R$ 5,00/mês para aparecer nas buscas.</p>
              </>
            ) : (
              <>
                <p className="font-semibold">Perfil em análise</p>
                <p>Nossa equipe vai aprovar seu perfil em breve. Capriche na foto e na descrição!</p>
              </>
            )}
          </div>
          {!active && (
            <ButtonLink href="/assinatura" size="sm" variant="primary">
              Assinar
            </ButtonLink>
          )}
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<Eye />} label="Visualizações do perfil" value={String(stats.visualizacoes)} hint={`+${stats.visualizacoes7d} nos últimos 7 dias`} />
        <StatCard icon={<Star />} label="Nota média" value={stats.nota > 0 ? stats.nota.toFixed(1).replace(".", ",") : "—"} tone="accent" />
        <StatCard icon={<MessageSquare />} label="Avaliações" value={String(stats.total_avaliacoes)} />
        <StatCard
          icon={<CalendarClock />}
          label={active ? "Assinatura ativa até" : "Assinatura"}
          value={active ? formatDate(subscription?.vencimento).replace(/ de /g, " ") : "Inativa"}
          tone={active ? "success" : "danger"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <SectionTitle title="Editar perfil" action={pro.aprovado ? <Badge tone="success">Aprovado</Badge> : <Badge tone="accent">Em análise</Badge>} />
            <div className="mb-6 flex justify-center">
              <AvatarUploader src={user.foto} name={user.nome} />
            </div>
            <ProfileForm user={user} pro={pro} categories={categories} />
          </Card>

          <Card>
            <SectionTitle title="Serviços oferecidos" />
            <ServicesManager services={services} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary to-primary-700 text-white">
            <p className="text-sm text-white/80">Plano Profissional</p>
            <p className="mt-1 text-3xl font-semibold">
              R$ 5,00<span className="text-base font-normal text-white/70">/mês</span>
            </p>
            <p className="mt-2 text-sm text-white/85">
              {active ? `Renova em ${formatDate(subscription?.vencimento)}` : "Seu anúncio não aparece nas buscas."}
            </p>
            <Link href="/assinatura" className="mt-4 inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-[#222] transition hover:bg-accent-600">
              {active ? "Gerenciar assinatura" : "Ativar agora"}
            </Link>
          </Card>

          <Card>
            <SectionTitle title="Últimas avaliações" />
            {reviews.length === 0 ? (
              <p className="text-sm text-muted">Você ainda não recebeu avaliações.</p>
            ) : (
              <ul className="space-y-4">
                {reviews.map((r) => (
                  <li key={r.id} className="flex gap-3">
                    <Avatar src={r.cliente_foto} name={r.cliente_nome} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{r.cliente_nome}</p>
                      <Stars value={r.nota} size={13} />
                      {r.comentario && <p className="mt-0.5 text-sm text-ink/80">{r.comentario}</p>}
                      <p className="mt-0.5 text-xs text-muted">{timeAgo(r.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
