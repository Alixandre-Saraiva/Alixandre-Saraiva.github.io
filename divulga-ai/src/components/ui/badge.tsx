import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tones = {
  primary: "bg-primary-50 text-primary-700 dark:bg-primary-900/60 dark:text-primary-200",
  accent: "bg-accent-100 text-accent-700 dark:bg-accent-700/25 dark:text-accent-300",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  danger: "bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-300",
  neutral: "bg-surface-2 text-muted",
};

export function Badge({ tone = "primary", children, className }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}
