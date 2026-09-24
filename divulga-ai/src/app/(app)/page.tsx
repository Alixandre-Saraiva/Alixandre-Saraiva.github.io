import { ArrowRight, Megaphone, Search, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { ProfessionalCard } from "@/components/professional/professional-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { getCurrentUser, getUserLocation, repo } from "@/lib/data";

export default async function HomePage() {
  const [user, location, categories] = await Promise.all([getCurrentUser(), getUserLocation(), repo.listCategories()]);
  const cidade = location?.cidade ?? user?.cidade ?? null;
  const coords = location ?? (user?.lat != null && user.lng != null ? { lat: user.lat, lng: user.lng } : null);

  const [topRated, nearby] = await Promise.all([
    repo.searchProfessionals({ ordem: "avaliacao", pageSize: 8, lat: coords?.lat, lng: coords?.lng }),
    coords
      ? repo.searchProfessionals({ ordem: "proximos", pageSize: 6, lat: coords.lat, lng: coords.lng })
      : cidade
        ? repo.searchProfessionals({ cidade, pageSize: 6 })
        : repo.searchProfessionals({ ordem: "recentes", pageSize: 6 }),
  ]);

  const nearbyTitle = coords ? "Perto de você" : cidade ? `Em ${cidade}` : "Novos na plataforma";

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-primary to-primary-700 px-5 pb-6 pt-7 text-white shadow-lift md:px-10 md:py-12">
        <div className="absolute -right-16 -top-16 size-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 right-24 size-40 rounded-full bg-accent/25" />
        <div className="relative max-w-xl">
          <p className="text-sm text-white/80">{user ? `Olá, ${user.nome.split(" ")[0]}!` : "Bem-vindo ao Divulga ai"}</p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight md:text-4xl">
            Encontre o profissional <span className="text-accent">certo</span> perto de você
          </h1>
          <form action="/buscar" className="mt-5 flex gap-2 rounded-2xl bg-white p-1.5 shadow-lift" role="search">
            <label className="relative flex-1">
              <span className="sr-only">O que você precisa?</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted" />
              <input name="q" placeholder="Ex.: eletricista, diarista…" className="h-11 w-full rounded-xl bg-transparent pl-10 pr-2 text-[15px] text-[#222] outline-none" />
            </label>
            <button className="rounded-xl bg-accent px-4 text-sm font-semibold text-[#222] transition hover:bg-accent-600 active:scale-95">Buscar</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-xs text-white/85">
            <span className="flex items-center gap-1.5"><Star className="size-3.5 fill-accent text-accent" /> Profissionais avaliados</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> Perfis aprovados</span>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section>
        <SectionTitle title="Categorias" action={<Link href="/buscar" className="text-sm font-medium text-primary">Ver todas</Link>} />
        <div className="-mx-4 grid auto-cols-[5.5rem] grid-flow-col gap-3 overflow-x-auto px-4 pb-2 scrollbar-none md:mx-0 md:grid-flow-row md:grid-cols-6 md:px-0 lg:grid-cols-11">
          {categories.map((c) => (
            <Link key={c.id} href={`/buscar?categoria=${c.slug}`} className="group flex flex-col items-center gap-2 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-surface text-primary shadow-soft transition group-hover:-translate-y-0.5 group-hover:bg-primary group-hover:text-white">
                <CategoryIcon name={c.icone} className="size-7" />
              </span>
              <span className="line-clamp-2 text-xs font-medium leading-tight">{c.nome}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Mais bem avaliados */}
      {topRated.items.length > 0 && (
        <section>
          <SectionTitle title="Mais bem avaliados" action={<Link href="/buscar" className="flex items-center gap-1 text-sm font-medium text-primary">Ver mais <ArrowRight className="size-4" /></Link>} />
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-none md:mx-0 md:px-0">
            {topRated.items.map((pro, i) => (
              <ProfessionalCard key={pro.id} pro={pro} index={i} compact />
            ))}
          </div>
        </section>
      )}

      {/* Perto de você */}
      <section>
        <SectionTitle
          title={nearbyTitle}
          action={<Link href={coords ? "/buscar?ordem=proximos" : cidade ? `/buscar?cidade=${encodeURIComponent(cidade)}` : "/buscar?ordem=recentes"} className="flex items-center gap-1 text-sm font-medium text-primary">Ver mais <ArrowRight className="size-4" /></Link>}
        />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {nearby.items.map((pro, i) => (
            <ProfessionalCard key={pro.id} pro={pro} index={i} />
          ))}
        </div>
      </section>

      {/* CTA profissional */}
      {user?.tipo !== "profissional" && user?.tipo !== "admin" && (
        <section className="flex flex-col items-start gap-4 rounded-[1.75rem] border border-accent/40 bg-accent-100 p-6 dark:bg-accent-700/15 md:flex-row md:items-center md:p-8">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-[#222]">
            <Megaphone className="size-7" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Você é profissional autônomo?</h2>
            <p className="mt-1 text-sm text-muted">Crie seu perfil, receba avaliações e seja encontrado por clientes da sua cidade por apenas <strong className="text-ink">R$ 5,00/mês</strong>.</p>
          </div>
          <ButtonLink href="/cadastro?tipo=profissional" variant="primary">Divulgar meus serviços</ButtonLink>
        </section>
      )}
    </div>
  );
}
