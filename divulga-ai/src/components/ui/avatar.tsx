import { cn, initials } from "@/lib/utils";

const sizes = { sm: "size-9 text-xs", md: "size-12 text-sm", lg: "size-20 text-xl", xl: "size-28 text-3xl" };

export function Avatar({ src, name, size = "md", className }: { src?: string | null; name: string; size?: keyof typeof sizes; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 font-semibold text-primary-700 ring-2 ring-surface dark:bg-primary-800 dark:text-primary-100",
        sizes[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- aceita data URLs do modo demo e do Storage
        <img src={src} alt={name} loading="lazy" decoding="async" className="size-full object-cover" />
      ) : (
        <span aria-label={name}>{initials(name)}</span>
      )}
    </div>
  );
}
