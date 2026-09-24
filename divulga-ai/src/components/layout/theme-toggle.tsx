"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

export function useIsDark() {
  return useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);
}

export function setTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {}
}

export function ThemeToggle({ className }: { className?: string }) {
  const dark = useIsDark();
  return (
    <button
      type="button"
      onClick={() => setTheme(!dark)}
      className={cn("flex size-10 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink", className)}
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

/** Aplica o tema antes da hidratação para evitar o "flash" de cor. */
export const themeScript = `try{if(sessionStorage.getItem('splash'))document.documentElement.dataset.splash='off';var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;
