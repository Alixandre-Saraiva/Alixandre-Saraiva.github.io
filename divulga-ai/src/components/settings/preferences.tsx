"use client";

import { Loader2, LocateFixed, Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { setTheme } from "@/components/layout/theme-toggle";
import { useToast } from "@/components/ui/toast";
import { useGeolocation } from "@/hooks/use-geolocation";
import { cn } from "@/lib/utils";

type Mode = "light" | "dark" | "system";

export function ThemeSelector() {
  const [mode, setMode] = useState<Mode>("system");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- lê preferência salva após montar
      setMode(saved === "dark" || saved === "light" ? saved : "system");
    } catch {}
  }, []);

  function choose(next: Mode) {
    setMode(next);
    if (next === "system") {
      try {
        localStorage.removeItem("theme");
      } catch {}
      document.documentElement.classList.toggle("dark", matchMedia("(prefers-color-scheme: dark)").matches);
    } else setTheme(next === "dark");
  }

  const options: [Mode, string, typeof Sun][] = [
    ["light", "Claro", Sun],
    ["dark", "Escuro", Moon],
    ["system", "Sistema", Monitor],
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map(([value, label, Icon]) => (
        <button
          key={value}
          onClick={() => choose(value)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-medium transition",
            mode === value ? "border-primary bg-primary-50 text-primary dark:bg-primary-900/40" : "border-line hover:border-primary/50",
          )}
          aria-pressed={mode === value}
        >
          <Icon className="size-5" /> {label}
        </button>
      ))}
    </div>
  );
}

export function LocationSetting({ cidade }: { cidade: string | null }) {
  const { detect, status } = useGeolocation();
  const toast = useToast();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium">{cidade ?? "Localização não definida"}</p>
        <p className="text-xs text-muted">Usada para mostrar profissionais próximos e a distância aproximada.</p>
      </div>
      <button
        onClick={async () => {
          const loc = await detect();
          toast(loc ? `Localização atualizada${loc.cidade ? `: ${loc.cidade}` : ""}` : "Permita o acesso à localização no navegador.", loc ? "success" : "error");
        }}
        className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:border-primary hover:text-primary"
      >
        {status === "loading" ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />} Detectar agora
      </button>
    </div>
  );
}
