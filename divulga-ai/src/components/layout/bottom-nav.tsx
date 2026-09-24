"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isActive, navItems } from "./nav-items";

export function BottomNav({ role }: { role: UserRole | null }) {
  const pathname = usePathname();
  // No celular, "Assinatura" fica acessível pelo painel.
  const items = navItems(role).filter((i) => i.href !== "/assinatura");

  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 backdrop-blur-lg md:hidden" aria-label="Navegação principal">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link href={href} className="relative flex flex-col items-center gap-0.5 py-1.5 text-[11px] font-medium" aria-current={active ? "page" : undefined}>
                {active && (
                  <motion.span layoutId="bottom-nav-pill" className="absolute top-0.5 h-8 w-14 rounded-full bg-primary-50 dark:bg-primary-900/60" transition={{ type: "spring", stiffness: 500, damping: 35 }} />
                )}
                <Icon className={cn("relative size-[22px] transition-colors", active ? "text-primary" : "text-muted")} strokeWidth={active ? 2.4 : 2} />
                <span className={cn("relative mt-1", active ? "text-primary" : "text-muted")}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
