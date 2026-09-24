import "server-only";
import { cookies } from "next/headers";
import { DEMO_SESSION_COOKIE, demoDB } from "@/lib/demo/store";
import { haversineKm } from "@/lib/geo";
import type { AdminUserRow, AppUser, ProfessionalDetail, ProfessionalSummary, Review } from "@/lib/types";
import { normalize } from "@/lib/utils";
import type { Repository } from "./repository";

const MAX_AVATAR_BYTES = 1_000_000;

function publicUser(u: AppUser & { senha?: string }): AppUser {
  const { senha: _senha, ...rest } = u;
  void _senha;
  return rest;
}

function isVisible(userId: string) {
  const db = demoDB();
  const p = db.profissionais.find((x) => x.user_id === userId);
  const u = db.users.find((x) => x.id === userId);
  return Boolean(p && u && p.aprovado && p.assinatura_ativa && !u.banido);
}

function toSummary(userId: string, viewer?: { lat: number; lng: number } | null): ProfessionalSummary | null {
  const db = demoDB();
  const p = db.profissionais.find((x) => x.user_id === userId);
  const u = db.users.find((x) => x.id === userId);
  if (!p || !u) return null;
  const cat = db.categorias.find((c) => c.id === p.categoria_id);
  return {
    id: u.id,
    nome: u.nome,
    foto: u.foto,
    cidade: u.cidade,
    lat: u.lat,
    lng: u.lng,
    profissao: p.profissao,
    nota: p.nota,
    total_avaliacoes: p.total_avaliacoes,
    valor_medio: p.valor_medio,
    created_at: p.created_at,
    categoria_slug: cat?.slug ?? null,
    categoria_nome: cat?.nome ?? null,
    distancia_km: viewer && u.lat != null && u.lng != null ? haversineKm(viewer.lat, viewer.lng, u.lat, u.lng) : null,
  };
}

function refreshRating(professionalId: string) {
  const db = demoDB();
  const p = db.profissionais.find((x) => x.user_id === professionalId);
  if (!p) return;
  const list = db.avaliacoes.filter((a) => a.profissional_id === professionalId);
  p.total_avaliacoes = list.length;
  p.nota = list.length ? Math.round((list.reduce((s, a) => s + a.nota, 0) / list.length) * 10) / 10 : 0;
}

function syncSubscriptionFlags() {
  const db = demoDB();
  const now = Date.now();
  for (const s of db.assinaturas) {
    if (s.status === "ativa" && s.vencimento && new Date(s.vencimento).getTime() < now) s.status = "vencida";
    const p = db.profissionais.find((x) => x.user_id === s.user_id);
    if (p) p.assinatura_ativa = s.status === "ativa";
  }
}

export const demoRepository: Repository = {
  async getCurrentUser() {
    const id = (await cookies()).get(DEMO_SESSION_COOKIE)?.value;
    const user = id ? demoDB().users.find((u) => u.id === id) : undefined;
    return user && !user.banido ? publicUser(user) : null;
  },

  async updateUser(userId, data) {
    const user = demoDB().users.find((u) => u.id === userId);
    if (user) Object.assign(user, Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)));
  },

  async uploadAvatar(userId, file) {
    if (file.size > MAX_AVATAR_BYTES) throw new Error("A imagem deve ter no máximo 1 MB.");
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = `data:${file.type};base64,${buffer.toString("base64")}`;
    await this.updateUser(userId, { foto: url });
    return url;
  },

  async listCategories(includeInactive = false) {
    return demoDB().categorias.filter((c) => includeInactive || c.ativo);
  },

  async searchProfessionals({ q, cidade, categoria, ordem = "avaliacao", lat, lng, page = 0, pageSize = 12 }) {
    syncSubscriptionFlags();
    const db = demoDB();
    const viewer = lat != null && lng != null ? { lat, lng } : null;
    const nq = q ? normalize(q) : "";
    const nc = cidade ? normalize(cidade) : "";
    let items = db.profissionais
      .filter((p) => isVisible(p.user_id))
      .map((p) => ({ summary: toSummary(p.user_id, viewer)!, descricao: p.descricao }))
      .filter(({ summary: s, descricao }) => {
        if (nq && !normalize(`${s.nome} ${s.profissao} ${s.categoria_nome ?? ""} ${descricao}`).includes(nq)) return false;
        if (nc && normalize(s.cidade ?? "") !== nc) return false;
        if (categoria && s.categoria_slug !== categoria) return false;
        return true;
      })
      .map(({ summary }) => summary);

    items.sort((a, b) => {
      if (ordem === "proximos") return (a.distancia_km ?? Infinity) - (b.distancia_km ?? Infinity);
      if (ordem === "recentes") return b.created_at.localeCompare(a.created_at);
      return b.nota - a.nota || b.total_avaliacoes - a.total_avaliacoes;
    });
    const start = page * pageSize;
    const hasMore = items.length > start + pageSize;
    items = items.slice(start, start + pageSize);
    return { items, hasMore };
  },

  async getProfessional(id, viewer) {
    syncSubscriptionFlags();
    const current = await this.getCurrentUser();
    const canSeeHidden = current && (current.id === id || current.tipo === "admin");
    if (!isVisible(id) && !canSeeHidden) return null;
    const db = demoDB();
    const summary = toSummary(id, viewer);
    const p = db.profissionais.find((x) => x.user_id === id);
    if (!summary || !p) return null;
    const detail: ProfessionalDetail = {
      ...summary,
      descricao: p.descricao,
      whatsapp: p.whatsapp,
      visualizacoes: p.visualizacoes,
      servicos: db.servicos.filter((s) => s.profissional_id === id).map(({ id, titulo, preco }) => ({ id, titulo, preco })),
    };
    return detail;
  },

  async registerView(professionalId) {
    const current = await this.getCurrentUser();
    if (current?.id === professionalId) return;
    const db = demoDB();
    const p = db.profissionais.find((x) => x.user_id === professionalId);
    if (!p) return;
    p.visualizacoes += 1;
    db.visualizacoes.push({ profissional_id: professionalId, created_at: new Date().toISOString() });
  },

  async getProfessionalRecord(userId) {
    syncSubscriptionFlags();
    return demoDB().profissionais.find((p) => p.user_id === userId) ?? null;
  },

  async updateProfessional(userId, data) {
    const p = demoDB().profissionais.find((x) => x.user_id === userId);
    if (p) Object.assign(p, Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined)));
  },

  async listServices(userId) {
    return demoDB()
      .servicos.filter((s) => s.profissional_id === userId)
      .map(({ id, titulo, preco }) => ({ id, titulo, preco }));
  },

  async addService(userId, titulo, preco) {
    demoDB().servicos.push({ id: crypto.randomUUID(), profissional_id: userId, titulo, preco });
  },

  async removeService(userId, serviceId) {
    const db = demoDB();
    db.servicos = db.servicos.filter((s) => !(s.id === serviceId && s.profissional_id === userId));
  },

  async getDashboardStats(userId) {
    const db = demoDB();
    const p = db.profissionais.find((x) => x.user_id === userId);
    const weekAgo = Date.now() - 7 * 86_400_000;
    return {
      visualizacoes: p?.visualizacoes ?? 0,
      visualizacoes7d: db.visualizacoes.filter((v) => v.profissional_id === userId && new Date(v.created_at).getTime() > weekAgo).length,
      nota: p?.nota ?? 0,
      total_avaliacoes: p?.total_avaliacoes ?? 0,
    };
  },

  async listReviews(professionalId, limit = 50) {
    const db = demoDB();
    return db.avaliacoes
      .filter((a) => a.profissional_id === professionalId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit)
      .map<Review>((a) => {
        const c = db.users.find((u) => u.id === a.cliente_id);
        return { ...a, cliente_nome: c?.nome ?? "Cliente", cliente_foto: c?.foto ?? null };
      });
  },

  async upsertReview(professionalId, clienteId, nota, comentario) {
    const db = demoDB();
    const existing = db.avaliacoes.find((a) => a.profissional_id === professionalId && a.cliente_id === clienteId);
    if (existing) Object.assign(existing, { nota, comentario, created_at: new Date().toISOString() });
    else
      db.avaliacoes.push({
        id: crypto.randomUUID(),
        profissional_id: professionalId,
        cliente_id: clienteId,
        nota,
        comentario,
        created_at: new Date().toISOString(),
      });
    refreshRating(professionalId);
  },

  async getSubscription(userId) {
    syncSubscriptionFlags();
    return demoDB().assinaturas.find((s) => s.user_id === userId) ?? null;
  },

  async listPayments(userId) {
    return demoDB()
      .pagamentos.filter((p) => p.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  async activateSubscription(userId, { provider, providerRef, paymentRef, valor, vencimento }) {
    const db = demoDB();
    let sub = db.assinaturas.find((s) => s.user_id === userId);
    if (!sub) {
      sub = { id: crypto.randomUUID(), user_id: userId, status: "ativa", valor, vencimento: null, provider, provider_ref: providerRef, renovacao_automatica: true };
      db.assinaturas.push(sub);
    }
    Object.assign(sub, { status: "ativa", valor, provider, provider_ref: providerRef, vencimento: vencimento.toISOString(), renovacao_automatica: true });
    db.pagamentos.push({
      id: crypto.randomUUID(),
      user_id: userId,
      valor,
      status: "aprovado",
      provider,
      provider_ref: paymentRef ?? null,
      created_at: new Date().toISOString(),
    });
    syncSubscriptionFlags();
  },

  async cancelSubscription(userId) {
    const sub = demoDB().assinaturas.find((s) => s.user_id === userId);
    if (sub) sub.renovacao_automatica = false;
  },

  async getAdminMetrics() {
    syncSubscriptionFlags();
    const db = demoDB();
    const monthAgo = Date.now() - 30 * 86_400_000;
    return {
      usuarios: db.users.length,
      clientes: db.users.filter((u) => u.tipo === "cliente").length,
      profissionais: db.profissionais.length,
      pendentes: db.profissionais.filter((p) => !p.aprovado).length,
      assinaturasAtivas: db.assinaturas.filter((s) => s.status === "ativa").length,
      receitaMensal: db.pagamentos.filter((p) => new Date(p.created_at).getTime() > monthAgo).reduce((s, p) => s + p.valor, 0),
      receitaTotal: db.pagamentos.reduce((s, p) => s + p.valor, 0),
      avaliacoes: db.avaliacoes.length,
    };
  },

  async listUsers(query) {
    const db = demoDB();
    const nq = query ? normalize(query) : "";
    return db.users
      .filter((u) => !nq || normalize(`${u.nome} ${u.email} ${u.cidade ?? ""}`).includes(nq))
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 100)
      .map<AdminUserRow>((u) => {
        const p = db.profissionais.find((x) => x.user_id === u.id);
        return { ...publicUser(u), profissional: p ? { profissao: p.profissao, aprovado: p.aprovado, assinatura_ativa: p.assinatura_ativa } : null };
      });
  },

  async listPendingProfessionals() {
    const db = demoDB();
    return db.profissionais
      .filter((p) => !p.aprovado)
      .map<AdminUserRow>((p) => {
        const u = db.users.find((x) => x.id === p.user_id)!;
        return { ...publicUser(u), profissional: { profissao: p.profissao, aprovado: p.aprovado, assinatura_ativa: p.assinatura_ativa } };
      });
  },

  async setApproved(userId, approved) {
    const p = demoDB().profissionais.find((x) => x.user_id === userId);
    if (p) p.aprovado = approved;
  },

  async setBanned(userId, banned) {
    const u = demoDB().users.find((x) => x.id === userId);
    if (u && u.tipo !== "admin") u.banido = banned;
  },

  async listAllPayments(limit = 50) {
    const db = demoDB();
    return [...db.pagamentos]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit)
      .map((p) => ({ ...p, user_nome: db.users.find((u) => u.id === p.user_id)?.nome }));
  },

  async addCategory(nome, icone) {
    const db = demoDB();
    const slug = normalize(nome).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (db.categorias.some((c) => c.slug === slug)) throw new Error("Essa categoria já existe.");
    db.categorias.push({ id: Math.max(0, ...db.categorias.map((c) => c.id)) + 1, slug, nome, icone, ativo: true });
  },

  async toggleCategory(id, ativo) {
    const c = demoDB().categorias.find((x) => x.id === id);
    if (c) c.ativo = ativo;
  },
};
