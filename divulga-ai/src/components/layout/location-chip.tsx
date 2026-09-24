"use client";

import { Loader2, LocateFixed, MapPin } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function LocationChip({ cidade, className }: { cidade: string | null; className?: string }) {
  const { detect, status } = useGeolocation();
  const toast = useToast();

  async function onClick() {
    const loc = await detect();
    if (loc) toast(loc.cidade ? `Mostrando profissionais perto de ${loc.cidade}` : "Localização atualizada", "info");
    else toast("Não foi possível obter sua localização. Verifique a permissão do navegador.", "error");
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex max-w-[42vw] items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-primary-50 dark:hover:bg-primary-900/40", className)}
    >
      {status === "loading" ? <Loader2 className="size-4 animate-spin text-primary" /> : cidade ? <MapPin className="size-4 text-primary" /> : <LocateFixed className="size-4 text-primary" />}
      <span className="truncate">{cidade ?? "Usar minha localização"}</span>
    </button>
  );
}
