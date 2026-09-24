"use client";

import { Loader2, SearchX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProfessionalSummary, SearchResult } from "@/lib/types";
import { ProfessionalCard } from "./professional-card";

/** Lista com infinite scroll: a 1ª página vem do servidor, as demais da API. */
export function ResultsList({ initial, query }: { initial: SearchResult; query: string }) {
  const [items, setItems] = useState<ProfessionalSummary[]>(initial.items);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [loading, setLoading] = useState(false);
  const page = useRef(0);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loading) return;
        setLoading(true);
        try {
          const params = new URLSearchParams(query);
          params.set("page", String(page.current + 1));
          const res = await fetch(`/api/profissionais?${params}`);
          const data = (await res.json()) as SearchResult;
          page.current += 1;
          setItems((prev) => [...prev, ...data.items.filter((d) => !prev.some((p) => p.id === d.id))]);
          setHasMore(data.hasMore);
        } catch {
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, query]);

  if (items.length === 0) {
    return <EmptyState icon={<SearchX />} title="Nenhum profissional encontrado" text="Tente outra palavra, categoria ou cidade." />;
  }

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((pro, i) => (
          <ProfessionalCard key={pro.id} pro={pro} index={i % 12} />
        ))}
      </div>
      <div ref={sentinel} className="flex h-16 items-center justify-center text-sm text-muted">
        {loading && <Loader2 className="size-5 animate-spin text-primary" />}
        {!hasMore && items.length > 6 && "Você chegou ao fim da lista"}
      </div>
    </>
  );
}
