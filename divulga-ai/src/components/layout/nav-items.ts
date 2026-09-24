import { Home, LayoutDashboard, MessageCircle, Search, Settings, ShieldCheck, CreditCard, type LucideIcon } from "lucide-react";
import type { UserRole } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function navItems(role: UserRole | null): NavItem[] {
  const items: NavItem[] = [
    { href: "/", label: "Início", icon: Home },
    { href: "/buscar", label: "Buscar", icon: Search },
    { href: "/conversas", label: "Conversas", icon: MessageCircle },
  ];
  if (role === "profissional") {
    items.push({ href: "/painel", label: "Meu painel", icon: LayoutDashboard });
    items.push({ href: "/assinatura", label: "Assinatura", icon: CreditCard });
  }
  if (role === "admin") items.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
  items.push({ href: "/configuracoes", label: "Ajustes", icon: Settings });
  return items;
}

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
