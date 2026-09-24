import { ChevronRight, CreditCard, LayoutDashboard, LogOut, Mail, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "@/actions/auth";
import { AvatarUploader } from "@/components/dashboard/avatar-uploader";
import { AccountForm } from "@/components/settings/account-form";
import { LocationSetting, ThemeSelector } from "@/components/settings/preferences";
import { Card, SectionTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getUserLocation } from "@/lib/data";

export const metadata: Metadata = { title: "Configurações", robots: { index: false } };

export default async function SettingsPage() {
  const user = await requireUser("/configuracoes");
  const location = await getUserLocation();

  const links = [
    ...(user.tipo === "profissional"
      ? [
          { href: "/painel", label: "Meu painel", icon: LayoutDashboard },
          { href: "/assinatura", label: "Assinatura e pagamentos", icon: CreditCard },
        ]
      : []),
    ...(user.tipo === "admin" ? [{ href: "/admin", label: "Administração", icon: ShieldCheck }] : []),
    { href: "mailto:contato@divulgaai.com.br", label: "Fale conosco", icon: Mail },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>

      <Card>
        <div className="mb-6 flex justify-center">
          <AvatarUploader src={user.foto} name={user.nome} />
        </div>
        <SectionTitle title="Minha conta" />
        <AccountForm user={user} />
      </Card>

      <Card>
        <SectionTitle title="Aparência" />
        <ThemeSelector />
      </Card>

      <Card>
        <SectionTitle title="Localização" />
        <LocationSetting cidade={location?.cidade ?? user.cidade} />
      </Card>

      <Card className="p-2">
        <ul>
          {links.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition hover:bg-surface-2">
                <Icon className="size-5 text-primary" />
                <span className="flex-1">{label}</span>
                <ChevronRight className="size-4 text-muted" />
              </Link>
            </li>
          ))}
          <li>
            <form action={signOut}>
              <button className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-900/20">
                <LogOut className="size-5" /> Sair
              </button>
            </form>
          </li>
        </ul>
      </Card>
    </div>
  );
}
