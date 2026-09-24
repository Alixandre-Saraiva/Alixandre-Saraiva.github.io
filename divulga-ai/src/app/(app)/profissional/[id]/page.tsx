import { ArrowLeft, Eye, MapPin, MessageCircle, Navigation, Star, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { HireButton } from "@/components/professional/hire-modal";
import { LazyMap } from "@/components/professional/lazy-map";
import { ProfileTabs } from "@/components/professional/profile-tabs";
import { ReviewForm } from "@/components/professional/review-form";
import { ViewTracker } from "@/components/professional/view-tracker";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Stars } from "@/components/ui/stars";
import { getCurrentUser, getUserLocation, repo } from "@/lib/data";
import { formatCurrency, formatDistance, timeAgo, whatsappLink } from "@/lib/utils";

const loadProfessional = cache(async (id: string) => {
  const location = await getUserLocation();
  return repo.getProfessional(id, location);
});

export async function generateMetadata({ params }: PageProps<"/profissional/[id]">): Promise<Metadata> {
  const { id } = await params;
  const pro = await loadProfessional(id);
  if (!pro) return { title: "Profissional não encontrado" };
  const title = `${pro.nome} — ${pro.profissao}${pro.cidade ? ` em ${pro.cidade}` : ""}`;
  const description = pro.descricao.slice(0, 155) || `${pro.profissao} com nota ${pro.nota.toFixed(1)} no Divulga ai.`;
  return {
    title,
    description,
    alternates: { canonical: `/profissional/${pro.id}` },
    openGraph: { title, description, type: "profile", images: pro.foto && !pro.foto.startsWith("data:") ? [pro.foto] : undefined },
  };
}

export default async function ProfessionalPage({ params }: PageProps<"/profissional/[id]">) {
  const { id } = await params;
  const [pro, user] = await Promise.all([loadProfessional(id), getCurrentUser()]);
  if (!pro) notFound();
  const reviews = await repo.listReviews(pro.id);
  const isOwner = user?.id === pro.id;
  const canReview = user && !isOwner;
  const distance = formatDistance(pro.distancia_km);
  const wa = whatsappLink(pro.whatsapp, `Olá, ${pro.nome.split(" ")[0]}! Vi seu perfil no Divulga ai.`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: pro.nome,
    description: pro.descricao,
    address: pro.cidade ? { "@type": "PostalAddress", addressLocality: pro.cidade, addressCountry: "BR" } : undefined,
    aggregateRating: pro.total_avaliacoes ? { "@type": "AggregateRating", ratingValue: pro.nota, reviewCount: pro.total_avaliacoes } : undefined,
  };

  return (
    <div className="-mx-4 -mt-4 md:mx-0 md:mt-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {!isOwner && <ViewTracker id={pro.id} />}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden bg-surface md:rounded-[1.75rem] md:shadow-soft">
          {/* Cabeçalho turquesa, como no protótipo */}
          <div className="relative rounded-b-[2.5rem] bg-primary px-5 pb-8 pt-4 text-center text-white">
            <div className="flex items-center justify-between">
              <Link href="/buscar" className="rounded-full p-2 hover:bg-white/15" aria-label="Voltar">
                <ArrowLeft className="size-5" />
              </Link>
              <Stars value={pro.nota} size={18} />
              <span className="w-9 text-sm font-semibold">{pro.nota > 0 ? pro.nota.toFixed(1).replace(".", ",") : ""}</span>
            </div>
            <Avatar src={pro.foto} name={pro.nome} size="xl" className="mx-auto mt-4 bg-white ring-4 ring-white/40" />
            <h1 className="mt-3 text-xl font-semibold">{pro.nome}</h1>
            <p className="text-sm text-white/85">{pro.profissao}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
              {pro.cidade && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                  <MapPin className="size-3.5" /> {pro.cidade}
                </span>
              )}
              {distance && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
                  <Navigation className="size-3.5" /> a {distance}
                </span>
              )}
              {pro.categoria_nome && <span className="rounded-full bg-accent px-3 py-1 font-semibold text-[#222]">{pro.categoria_nome}</span>}
            </div>
          </div>

          <div className="grid grid-cols-3 divide-x divide-line border-b border-line py-4 text-center">
            <Stat icon={<Star className="size-4 fill-accent text-accent" />} value={pro.nota > 0 ? pro.nota.toFixed(1).replace(".", ",") : "—"} label="nota" />
            <Stat icon={<MessageCircle className="size-4 text-primary" />} value={String(pro.total_avaliacoes)} label="avaliações" />
            <Stat icon={<Eye className="size-4 text-primary" />} value={String(pro.visualizacoes)} label="visitas" />
          </div>

          <div className="px-5 pb-8">
            <ProfileTabs
              panels={{
                avaliacoes: (
                  <div className="space-y-4">
                    {canReview && <ReviewForm professionalId={pro.id} />}
                    {!user && (
                      <p className="rounded-2xl bg-surface-2 p-4 text-sm text-muted">
                        <Link href={`/login?next=/profissional/${pro.id}`} className="font-semibold text-primary">Entre</Link> para avaliar este profissional.
                      </p>
                    )}
                    {reviews.length === 0 ? (
                      <EmptyState icon={<Star />} title="Ainda sem avaliações" text="Contratou este profissional? Seja o primeiro a avaliar." />
                    ) : (
                      <ul className="divide-y divide-line">
                        {reviews.map((r) => (
                          <li key={r.id} className="flex gap-3 py-4">
                            <Avatar src={r.cliente_foto} name={r.cliente_nome} size="sm" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-semibold">{r.cliente_nome}</p>
                                <span className="shrink-0 text-xs text-muted">{timeAgo(r.created_at)}</span>
                              </div>
                              <Stars value={r.nota} size={14} />
                              {r.comentario && <p className="mt-1 text-sm text-ink/80">{r.comentario}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
                servicos:
                  pro.servicos.length === 0 ? (
                    <EmptyState icon={<Wrench />} title="Serviços sob consulta" text="Peça um orçamento pelo botão de contratar." />
                  ) : (
                    <ul className="space-y-2">
                      {pro.servicos.map((s) => (
                        <li key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line p-4">
                          <span className="font-medium">{s.titulo}</span>
                          <span className="shrink-0 text-sm font-semibold text-primary">{formatCurrency(s.preco)}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                sobre: (
                  <div className="space-y-5">
                    <div>
                      <h2 className="mb-2 text-sm font-semibold text-muted">Descrição</h2>
                      <p className="whitespace-pre-line rounded-2xl bg-surface-2 p-4 text-sm leading-relaxed">{pro.descricao || "Este profissional ainda não escreveu uma descrição."}</p>
                    </div>
                    {pro.lat != null && pro.lng != null && (
                      <div>
                        <h2 className="mb-2 text-sm font-semibold text-muted">Região de atendimento (aproximada)</h2>
                        <div className="overflow-hidden rounded-[var(--radius-card)]">
                          <LazyMap pros={[pro]} center={{ lat: pro.lat, lng: pro.lng }} approximate className="h-56 w-full" />
                        </div>
                      </div>
                    )}
                  </div>
                ),
              }}
            />
          </div>
        </div>

        {/* Lateral (desktop) */}
        <aside className="hidden lg:block">
          <Card className="sticky top-8 space-y-4">
            <div>
              <p className="text-xs text-muted">Valor médio</p>
              <p className="text-2xl font-semibold text-primary">{formatCurrency(pro.valor_medio)}</p>
            </div>
            {isOwner ? (
              <Link href="/painel" className="block text-center text-sm font-semibold text-primary">Editar meu perfil</Link>
            ) : (
              <HireButton pro={pro} className="w-full" />
            )}
            {wa && !isOwner && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#25D366] text-sm font-semibold text-[#1ea952] transition hover:bg-[#25D366]/10">
                <MessageCircle className="size-4" /> Chamar no WhatsApp
              </a>
            )}
            <Badge tone="success">Perfil verificado</Badge>
          </Card>
        </aside>
      </div>

      {/* Barra fixa (celular) */}
      {!isOwner && (
        <div className="fixed inset-x-0 bottom-[4.25rem] z-30 flex items-center gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur-lg lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted">a partir de</p>
            <p className="font-semibold text-primary">{formatCurrency(pro.valor_medio)}</p>
          </div>
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex size-12 items-center justify-center rounded-full bg-[#25D366] text-white">
              <MessageCircle className="size-5" />
            </a>
          )}
          <HireButton pro={pro} />
        </div>
      )}
      <div className="h-20 lg:hidden" />
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div>
      <p className="flex items-center justify-center gap-1.5 text-lg font-semibold">
        {icon}
        {value}
      </p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
