import type { ReactNode } from "react";

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line bg-surface/60 px-6 py-12 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary-50 text-primary dark:bg-primary-900/50 [&>svg]:size-7">{icon}</div>
      <p className="font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
