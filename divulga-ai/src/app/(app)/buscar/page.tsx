import type { Metadata } from "next";
import { Suspense } from "react";
import { LazyMap } from "@/components/professional/lazy-map";
import { ResultsList } from "@/components/professional/results-list";
import { SearchFilters } from "@/components/professional/search-filters";
import { getUserLocation, repo } from "@/lib/data";
import type { SortOrder } from "@/lib/types";

const ORDERS: SortOrder[] = ["avaliacao", "proximos", "recentes"];

export async function generateMetadata({ searchParams }: PageProps<"/buscar">): Promise<Metadata> {
  const sp = await searchParams;
  const parts = [sp.q, sp.categoria, sp.cidade].filter((v): v is string => typeof v === "string");
  return {
    title: parts.length ? `Profissionais: ${parts.join(" · ")}` : "Buscar profissionais",
    description: "Pesquise profissionais autônomos por serviço, categoria e cidade, com avaliações de clientes.",
    alternates: { canonical: "/buscar" },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/buscar">) {
  const sp = await searchParams;
  const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
  const location = await getUserLocation();
  const ordem = ORDERS.includes(str(sp.ordem) as SortOrder) ? (str(sp.ordem) as SortOrder) : "avaliacao";
  const mapa = str(sp.ver) === "mapa";

  const filters = { q: str(sp.q), cidade: str(sp.cidade), categoria: str(sp.categoria), ordem };
  const [categories, result] = await Promise.all([
    repo.listCategories(),
    repo.searchProfessionals({ ...filters, lat: location?.lat, lng: location?.lng, pageSize: mapa ? 50 : 12 }),
  ]);

  const query = new URLSearchParams(Object.entries(filters).filter((e): e is [string, string] => Boolean(e[1]))).toString();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Procurar profissionais</h1>
        <p className="text-sm text-muted">Encontre quem resolve, pertinho de você.</p>
      </div>
      <Suspense>
        <SearchFilters categories={categories} hasLocation={Boolean(location)} />
      </Suspense>
      {mapa ? (
        <div className="overflow-hidden rounded-[var(--radius-card)] shadow-soft">
          <LazyMap pros={result.items} center={location} />
        </div>
      ) : (
        <ResultsList key={query} initial={result} query={query} />
      )}
    </div>
  );
}
