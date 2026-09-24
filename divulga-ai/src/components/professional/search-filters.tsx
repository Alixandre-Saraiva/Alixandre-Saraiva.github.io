"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, List, Map as MapIcon, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CategoryIcon } from "@/components/ui/category-icon";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

const ORDERS = [
  { value: "avaliacao", label: "Melhor avaliados" },
  { value: "proximos", label: "Mais próximos" },
  { value: "recentes", label: "Mais recentes" },
];

export function SearchFilters({ categories, hasLocation }: { categories: Category[]; hasLocation: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [cidade, setCidade] = useState(params.get("cidade") ?? "");
  const [open, setOpen] = useState(Boolean(params.get("cidade")));

  const categoria = params.get("categoria") ?? "";
  const ordem = params.get("ordem") ?? "avaliacao";
  const view = params.get("ver") ?? "lista";

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    startTransition(() => router.replace(`${pathname}?${sp}`, { scroll: false }));
  }

  // Busca enquanto digita (com debounce)
  useEffect(() => {
    if (q === (params.get("q") ?? "")) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q.trim() || null, cidade: cidade.trim() || null });
        }}
        className="flex gap-2"
        role="search"
      >
        <label className="relative flex-1">
          <span className="sr-only">Pesquisar</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Procurar profissional ou serviço"
            className="h-12 w-full rounded-2xl border border-line bg-surface pl-12 pr-4 text-[15px] shadow-soft outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          {pending && <span className="absolute right-4 top-1/2 size-2 -translate-y-1/2 animate-ping rounded-full bg-primary" />}
        </label>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn("flex size-12 shrink-0 items-center justify-center rounded-2xl border shadow-soft transition", open ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink")}
          aria-label="Filtros"
          aria-expanded={open}
        >
          <SlidersHorizontal className="size-5" />
        </button>
      </form>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2">
              <label className="relative block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Cidade</span>
                <MapPin className="pointer-events-none absolute bottom-3.5 left-3.5 size-4 text-muted" />
                <input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  onBlur={() => cidade !== (params.get("cidade") ?? "") && update({ cidade: cidade.trim() || null })}
                  onKeyDown={(e) => e.key === "Enter" && update({ cidade: cidade.trim() || null })}
                  placeholder="Todas as cidades"
                  className="h-11 w-full rounded-xl border border-line bg-bg pl-10 pr-3 text-sm outline-none focus:border-primary"
                />
              </label>
              <label className="relative block">
                <span className="mb-1.5 block text-xs font-medium text-muted">Ordenar por</span>
                <ArrowUpDown className="pointer-events-none absolute bottom-3.5 left-3.5 size-4 text-muted" />
                <select
                  value={ordem}
                  onChange={(e) => update({ ordem: e.target.value === "avaliacao" ? null : e.target.value })}
                  className="h-11 w-full appearance-none rounded-xl border border-line bg-bg pl-10 pr-3 text-sm outline-none focus:border-primary"
                >
                  {ORDERS.map((o) => (
                    <option key={o.value} value={o.value} disabled={o.value === "proximos" && !hasLocation}>
                      {o.label}
                      {o.value === "proximos" && !hasLocation ? " (ative a localização)" : ""}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none md:mx-0 md:flex-wrap md:px-0">
        <Chip active={!categoria} onClick={() => update({ categoria: null })}>
          Todos
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={categoria === c.slug} onClick={() => update({ categoria: categoria === c.slug ? null : c.slug })}>
            <CategoryIcon name={c.icone} className="size-4" />
            {c.nome}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {params.get("cidade") && (
            <ActiveFilter onClear={() => { setCidade(""); update({ cidade: null }); }}>Cidade: {params.get("cidade")}</ActiveFilter>
          )}
          {ordem !== "avaliacao" && <ActiveFilter onClear={() => update({ ordem: null })}>{ORDERS.find((o) => o.value === ordem)?.label}</ActiveFilter>}
        </div>
        <div className="ml-auto flex rounded-full bg-surface-2 p-1 text-xs font-medium">
          {[
            ["lista", "Lista", List],
            ["mapa", "Mapa", MapIcon],
          ].map(([value, label, Icon]) => {
            const I = Icon as typeof List;
            return (
              <button
                key={value as string}
                onClick={() => update({ ver: value === "lista" ? null : (value as string) })}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 transition", view === value ? "bg-surface text-primary shadow-soft" : "text-muted")}
              >
                <I className="size-3.5" /> {label as string}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition active:scale-95",
        active ? "border-primary bg-primary text-white shadow-soft" : "border-line bg-surface text-ink hover:border-primary/50",
      )}
    >
      {children}
    </button>
  );
}

function ActiveFilter({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 py-1 pl-3 pr-1 text-xs font-medium text-primary-700 dark:bg-primary-900/50 dark:text-primary-200">
      {children}
      <button onClick={onClear} className="rounded-full p-1 hover:bg-primary-100 dark:hover:bg-primary-800" aria-label="Remover filtro">
        <X className="size-3" />
      </button>
    </span>
  );
}
