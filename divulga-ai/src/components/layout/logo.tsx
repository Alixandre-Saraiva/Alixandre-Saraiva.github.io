import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <ellipse cx="17" cy="15" rx="9" ry="6.5" fill="#fff" opacity=".85" transform="rotate(-25 17 15)" />
      <ellipse cx="31" cy="15" rx="9" ry="6.5" fill="#fff" opacity=".85" transform="rotate(25 31 15)" />
      <rect x="10" y="17" width="28" height="24" rx="12" fill="#F4C542" />
      <path d="M17 18.5v21M24 17v24M31 18.5v21" stroke="#0F9DA8" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="24" cy="9" r="3" fill="#F4C542" />
    </svg>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary shadow-soft">
        <LogoMark className="size-7" />
      </span>
      <span className={cn("whitespace-nowrap text-lg", light ? "text-white" : "text-ink")}>
        Divulga <span className="text-accent">ai</span>
      </span>
    </span>
  );
}
