import Link from "next/link";
import { Logo } from "./logo";
import { LocationChip } from "./location-chip";
import { ThemeToggle } from "./theme-toggle";

export function MobileHeader({ cidade }: { cidade: string | null }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-line/60 bg-bg/85 px-4 py-2.5 backdrop-blur-lg md:hidden">
      <Link href="/" aria-label="Início">
        <Logo />
      </Link>
      <div className="flex items-center gap-1">
        <LocationChip cidade={cidade} />
        <ThemeToggle />
      </div>
    </header>
  );
}
