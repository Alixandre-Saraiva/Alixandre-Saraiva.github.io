import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({ icon, label, value, hint, tone = "primary" }: { icon: ReactNode; label: string; value: string; hint?: string; tone?: "primary" | "accent" | "success" | "danger" }) {
  const tones = {
    primary: "bg-primary-50 text-primary dark:bg-primary-900/50",
    accent: "bg-accent-100 text-accent-700 dark:bg-accent-700/25 dark:text-accent-300",
    success: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300",
    danger: "bg-red-50 text-red-500 dark:bg-red-900/40 dark:text-red-300",
  };
  return (
    <div className="rounded-[var(--radius-card)] border border-line/70 bg-surface p-4 shadow-soft">
      <span className={cn("flex size-10 items-center justify-center rounded-xl [&>svg]:size-5", tones[tone])}>{icon}</span>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs font-medium text-primary">{hint}</p>}
    </div>
  );
}
