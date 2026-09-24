import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[var(--radius-card)] border border-line/70 bg-surface p-5 shadow-soft", className)} {...props} />;
}

export function SectionTitle({ title, action, className }: { title: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {action}
    </div>
  );
}
