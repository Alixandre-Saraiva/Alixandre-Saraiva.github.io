import { BarChart3, CreditCard, FolderCog, Search, ShieldCheck, Star, UserCheck, Users, Wallet } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ApprovalButtons, BanButton, CategoryToggle } from "@/components/admin/admin-actions";
import { CategoryForm } from "@/components/admin/category-form";
import { StatCard } from "@/components/dashboard/stat-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, SectionTitle } from "@/components/ui/card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { requireRole } from "@/lib/auth";
import { repo } from "@/lib/data";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Administração", robots: { index: false } };

const TABS = [
  { id: "metricas", label: "Métricas", icon: BarChart3 },
  { id: "aprovacoes", label: "Aprovações", icon: UserCheck },
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
  { id: "categorias", label: "Categorias", icon: FolderCog },
] as const;

type Tab = (typeof TABS)[number]["id"];

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const user = await requireRole("admin", "/admin");
  if (user.tipo !== "admin") return null;
  const sp = await searchParams;
  const tab: Tab = TABS.some((t) => t.id === sp.aba) ? (sp.aba as Tab) : "metricas";
  const q = typeof sp.q === "string" ? sp.q : "";
  const metrics = await repo.getAdminMetrics();

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-white">
          <ShieldCheck className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Administração</h1>
          <p className="text-sm text-muted">Gerencie profissionais, usuários e pagamentos.</p>
        </div>
      </header>

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 scrollbar-none md:mx-0 md:px-0" aria-label="Seções">
        {TABS.map(({ id, label, icon: Icon }) => (
          <Link
            key={id}
            href={`/admin?aba=${id}`}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition",
              tab === id ? "border-primary bg-primary text-white" : "border-line bg-surface hover:border-primary/50",
            )}
          >
            <Icon className="size-4" /> {label}
            {id === "aprovacoes" && metrics.pendentes > 0 && (
              <span className={cn("rounded-full px-1.5 text-xs", tab === id ? "bg-white/25" : "bg-accent text-[#222]")}>{metrics.pendentes}</span>
            )}
          </Link>
        ))}
      </nav>

      {tab === "metricas" && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard icon={<Users />} label="Usuários cadastrados" value={String(metrics.usuarios)} hint={`${metrics.clientes} clientes`} />
          <StatCard icon={<UserCheck />} label="Profissionais" value={String(metrics.profissionais)} hint={`${metrics.pendentes} aguardando aprovação`} />
          <StatCard icon={<CreditCard />} label="Assinaturas ativas" value={String(metrics.assinaturasAtivas)} tone="success" />
          <StatCard icon={<Star />} label="Avaliações" value={String(metrics.avaliacoes)} tone="accent" />
          <StatCard icon={<Wallet />} label="Receita (30 dias)" value={formatCurrency(metrics.receitaMensal)} tone="success" />
          <StatCard icon={<Wallet />} label="Receita total" value={formatCurrency(metrics.receitaTotal)} />
          <StatCard icon={<BarChart3 />} label="MRR estimado" value={formatCurrency(metrics.assinaturasAtivas * 5)} hint="assinaturas × R$ 5" />
          <StatCard
            icon={<BarChart3 />}
            label="Conversão profissionais"
            value={`${metrics.profissionais ? Math.round((metrics.assinaturasAtivas / metrics.profissionais) * 100) : 0}%`}
            hint="com assinatura ativa"
          />
        </section>
      )}

      {tab === "aprovacoes" && <Approvals />}
      {tab === "usuarios" && <UsersTab q={q} />}
      {tab === "pagamentos" && <PaymentsTab />}
      {tab === "categorias" && <CategoriesTab />}
    </div>
  );
}

async function Approvals() {
  const pending = await repo.listPendingProfessionals();
  if (pending.length === 0) return <EmptyState icon={<UserCheck />} title="Tudo em dia!" text="Nenhum profissional aguardando aprovação." />;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {pending.map((u) => (
        <Card key={u.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Avatar src={u.foto} name={u.nome} />
            <div className="min-w-0">
              <Link href={`/profissional/${u.id}`} className="block truncate font-semibold hover:text-primary">{u.nome}</Link>
              <p className="truncate text-sm text-muted">{u.profissional?.profissao} · {u.cidade}</p>
              <p className="truncate text-xs text-muted">{u.email}</p>
            </div>
          </div>
          <ApprovalButtons userId={u.id} />
        </Card>
      ))}
    </div>
  );
}

async function UsersTab({ q }: { q: string }) {
  const users = await repo.listUsers(q);
  return (
    <Card className="p-0">
      <form className="border-b border-line p-4" role="search">
        <input type="hidden" name="aba" value="usuarios" />
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Buscar por nome, e-mail ou cidade" className="h-11 w-full rounded-2xl border border-line bg-bg pl-10 pr-4 text-sm outline-none focus:border-primary" />
        </label>
      </form>
      <ul className="divide-y divide-line">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 p-4">
            <Avatar src={u.foto} name={u.nome} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                {u.nome}
                <Badge tone={u.tipo === "admin" ? "accent" : u.tipo === "profissional" ? "primary" : "neutral"}>{u.tipo}</Badge>
                {u.banido && <Badge tone="danger">banido</Badge>}
                {u.profissional && !u.profissional.aprovado && <Badge tone="accent">pendente</Badge>}
              </p>
              <p className="truncate text-xs text-muted">{u.email} · {u.cidade ?? "—"} · desde {formatDate(u.created_at)}</p>
            </div>
            {u.tipo !== "admin" && <BanButton userId={u.id} banned={u.banido} />}
          </li>
        ))}
      </ul>
      {users.length === 0 && <p className="p-6 text-center text-sm text-muted">Nenhum usuário encontrado.</p>}
    </Card>
  );
}

async function PaymentsTab() {
  const payments = await repo.listAllPayments(100);
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="p-4 font-medium">Profissional</th>
            <th className="p-4 font-medium">Data</th>
            <th className="p-4 font-medium">Provedor</th>
            <th className="p-4 font-medium">Status</th>
            <th className="p-4 text-right font-medium">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {payments.map((p) => (
            <tr key={p.id}>
              <td className="p-4 font-medium">{p.user_nome ?? "—"}</td>
              <td className="p-4 text-muted">{formatDate(p.created_at)}</td>
              <td className="p-4 capitalize">{p.provider}</td>
              <td className="p-4"><Badge tone="success">{p.status}</Badge></td>
              <td className="p-4 text-right font-semibold">{formatCurrency(p.valor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {payments.length === 0 && <p className="p-6 text-center text-sm text-muted">Nenhum pagamento registrado.</p>}
    </Card>
  );
}

async function CategoriesTab() {
  const categories = await repo.listCategories(true);
  return (
    <Card className="space-y-5">
      <SectionTitle title="Categorias de serviço" />
      <CategoryForm />
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.id} className={cn("flex items-center gap-3 rounded-2xl border border-line p-3", !c.ativo && "opacity-60")}>
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary dark:bg-primary-900/50">
              <CategoryIcon name={c.icone} className="size-5" />
            </span>
            <span className="flex-1 text-sm font-medium">{c.nome}</span>
            <CategoryToggle id={c.id} ativo={c.ativo} />
          </li>
        ))}
      </ul>
    </Card>
  );
}
