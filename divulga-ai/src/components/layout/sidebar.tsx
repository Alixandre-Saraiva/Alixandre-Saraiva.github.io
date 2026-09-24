"use client";

import { motion } from "framer-motion";
import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import type { AppUser } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { isActive, navItems } from "./nav-items";
import { ThemeToggle } from "./theme-toggle";

const roleLabel = { cliente: "Cliente", profissional: "Profissional", admin: "Administrador" };

export function Sidebar({ user }: { user: AppUser | null }) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 md:flex lg:w-72">
      <Link href="/" className="px-2">
        <Logo />
      </Link>

      {user ? (
        <Link href="/configuracoes" className="mt-8 flex items-center gap-3 rounded-2xl bg-surface-2 p-3 transition hover:bg-primary-50 dark:hover:bg-primary-900/40">
          <Avatar src={user.foto} name={user.nome} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.nome}</p>
            <p className="text-xs text-primary">{roleLabel[user.tipo]}</p>
          </div>
        </Link>
      ) : (
        <Link href="/login" className="mt-8 flex items-center gap-3 rounded-2xl bg-primary p-3 text-white">
          <LogIn className="size-5" />
          <span className="text-sm font-semibold">Entrar ou criar conta</span>
        </Link>
      )}

      <nav className="mt-6 flex-1" aria-label="Navegação principal">
        <ul className="space-y-1">
          {navItems(user?.tipo ?? null).map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "text-primary" : "text-muted hover:bg-surface-2 hover:text-ink")}
                >
                  {active && <motion.span layoutId="sidebar-pill" className="absolute inset-0 rounded-xl bg-primary-50 dark:bg-primary-900/50" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                  <Icon className="relative size-5" />
                  <span className="relative">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {user?.tipo === "cliente" && (
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary-700 p-4 text-white">
          <p className="text-sm font-semibold">Trabalha por conta própria?</p>
          <p className="mt-1 text-xs text-white/80">Divulgue seus serviços por apenas R$ 5/mês.</p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-line pt-4">
        <ThemeToggle />
        {user && (
          <form action={signOut}>
            <button className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-red-500">
              <LogOut className="size-4" /> Sair
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
