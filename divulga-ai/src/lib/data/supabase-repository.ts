import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { haversineKm } from "@/lib/geo";
import type {
  AdminUserRow,
  AppUser,
  Payment,
  ProfessionalDetail,
  ProfessionalRecord,
  ProfessionalSummary,
  Review,
  Subscription,
} from "@/lib/types";
import { normalize } from "@/lib/utils";
import type { Repository } from "./repository";

const MAX_AVATAR_BYTES = 2_000_000;

function fail(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

const num = (v: unknown) => (v == null ? null : Number(v));

function mapSummary(row: Record<string, unknown>, viewer?: { lat: number; lng: number } | null): ProfessionalSummary {
  const lat = num(row.lat);
  const lng = num(row.lng);
  return {
    id: row.id as string,
    nome: row.nome as string,
    foto: (row.foto as string) ?? null,
    cidade: (row.cidade as string) ?? null,
    lat,
    lng,
    profissao: (row.profissao as string) ?? "",
    nota: Number(row.nota ?? 0),
    total_avaliacoes: Number(row.total_avaliacoes ?? 0),
    valor_medio: num(row.valor_medio),
    created_at: row.created_at as string,
    categoria_slug: (row.categoria_slug as string) ?? null,
    categoria_nome: (row.categoria_nome as string) ?? null,
    distancia_km:
      row.distancia_km != null
        ? Number(row.distancia_km)
        : viewer && lat != null && lng != null
          ? haversineKm(viewer.lat, viewer.lng, lat, lng)
          : null,
  };
}

export const supabaseRepository: Repository = {
  async getCurrentUser() {
    const supabase = await createSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data } = await supabase.from("users").select("*").eq("id", auth.user.id).maybeSingle<AppUser>();
    if (!data || data.banido) return null;
    return data;
  },

  async updateUser(userId, data) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("users").update(data).eq("id", userId);
    fail(error);
  },

  async uploadAvatar(userId, file) {
    if (file.size > MAX_AVATAR_BYTES) throw new Error("A imagem deve ter no máximo 2 MB.");
    const supabase = await createSupabaseServerClient();
    const ext = file.type.split("/")[1] ?? "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    fail(error);
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await this.updateUser(userId, { foto: data.publicUrl });
    return data.publicUrl;
  },

  async listCategories(includeInactive = false) {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from("categorias").select("*").order("nome");
    if (!includeInactive) query = query.eq("ativo", true);
    const { data, error } = await query;
    fail(error);
    return data ?? [];
  },

  async searchProfessionals({ q, cidade, categoria, ordem = "avaliacao", lat, lng, page = 0, pageSize = 12 }) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.rpc("search_profissionais", {
      p_q: q || null,
      p_cidade: cidade || null,
      p_categoria: categoria || null,
      p_ordem: ordem,
      p_lat: lat ?? null,
      p_lng: lng ?? null,
      p_limit: pageSize + 1,
      p_offset: page * pageSize,
    });
    fail(error);
    const rows = (data ?? []) as Record<string, unknown>[];
    return { items: rows.slice(0, pageSize).map((r) => mapSummary(r)), hasMore: rows.length > pageSize };
  },

  async getProfessional(id, viewer) {
    const supabase = await createSupabaseServerClient();
    const { data: pub } = await supabase.from("profissionais_publicos").select("*").eq("id", id).maybeSingle();
    let row: Record<string, unknown>;

    if (pub) {
      row = pub;
    } else {
      // Não publicado: só o dono ou um admin conseguem ler (RLS).
      const { data } = await supabase
        .from("profissionais")
        .select("*, users!inner(nome, foto, cidade, lat, lng), categorias(slug, nome)")
        .eq("user_id", id)
        .maybeSingle();
      if (!data) return null;
      const u = data.users as unknown as Record<string, unknown>;
      const c = data.categorias as unknown as Record<string, unknown> | null;
      row = { ...data, ...u, id: data.user_id, categoria_slug: c?.slug ?? null, categoria_nome: c?.nome ?? null };
    }

    const { data: servicos } = await supabase.from("servicos").select("id, titulo, preco").eq("profissional_id", id).order("created_at");
    const detail: ProfessionalDetail = {
      ...mapSummary(row, viewer),
      descricao: (row.descricao as string) ?? "",
      whatsapp: (row.whatsapp as string) ?? null,
      visualizacoes: Number(row.visualizacoes ?? 0),
      servicos: (servicos ?? []).map((s) => ({ id: s.id, titulo: s.titulo, preco: num(s.preco) })),
    };
    return detail;
  },

  async registerView(professionalId) {
    const supabase = await createSupabaseServerClient();
    await supabase.rpc("register_view", { p_profissional: professionalId });
  },

  async getProfessionalRecord(userId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("profissionais").select("*").eq("user_id", userId).maybeSingle<ProfessionalRecord>();
    return data ? { ...data, nota: Number(data.nota), valor_medio: num(data.valor_medio) } : null;
  },

  async updateProfessional(userId, data) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("profissionais").update(data).eq("user_id", userId);
    fail(error);
  },

  async listServices(userId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("servicos").select("id, titulo, preco").eq("profissional_id", userId).order("created_at");
    return (data ?? []).map((s) => ({ ...s, preco: num(s.preco) }));
  },

  async addService(userId, titulo, preco) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("servicos").insert({ profissional_id: userId, titulo, preco });
    fail(error);
  },

  async removeService(userId, serviceId) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("servicos").delete().eq("id", serviceId).eq("profissional_id", userId);
    fail(error);
  },

  async getDashboardStats(userId) {
    const supabase = await createSupabaseServerClient();
    const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const [{ data: p }, { count }] = await Promise.all([
      supabase.from("profissionais").select("visualizacoes, nota, total_avaliacoes").eq("user_id", userId).maybeSingle(),
      supabase.from("visualizacoes").select("id", { count: "exact", head: true }).eq("profissional_id", userId).gte("created_at", weekAgo),
    ]);
    return {
      visualizacoes: p?.visualizacoes ?? 0,
      visualizacoes7d: count ?? 0,
      nota: Number(p?.nota ?? 0),
      total_avaliacoes: p?.total_avaliacoes ?? 0,
    };
  },

  async listReviews(professionalId, limit = 50) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("avaliacoes_publicas")
      .select("*")
      .eq("profissional_id", professionalId)
      .order("created_at", { ascending: false })
      .limit(limit);
    fail(error);
    return (data ?? []) as Review[];
  },

  async upsertReview(professionalId, clienteId, nota, comentario) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("avaliacoes")
      .upsert({ profissional_id: professionalId, cliente_id: clienteId, nota, comentario }, { onConflict: "profissional_id,cliente_id" });
    fail(error);
  },

  async getSubscription(userId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("assinaturas").select("*").eq("user_id", userId).maybeSingle<Subscription>();
    return data ? { ...data, valor: Number(data.valor) } : null;
  },

  async listPayments(userId) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("pagamentos").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return ((data ?? []) as Payment[]).map((p) => ({ ...p, valor: Number(p.valor) }));
  },

  async activateSubscription(userId, { provider, providerRef, paymentRef, valor, vencimento }) {
    // Chamado pelos webhooks de pagamento: precisa da service role.
    const admin = createSupabaseAdminClient();
    const { data: sub, error } = await admin
      .from("assinaturas")
      .upsert(
        { user_id: userId, status: "ativa", valor, provider, provider_ref: providerRef, vencimento: vencimento.toISOString(), renovacao_automatica: true },
        { onConflict: "user_id" },
      )
      .select("id")
      .single();
    fail(error);
    const { error: payError } = await admin
      .from("pagamentos")
      .upsert(
        { user_id: userId, assinatura_id: sub?.id, valor, status: "aprovado", provider, provider_ref: paymentRef ?? null },
        { onConflict: "provider_ref", ignoreDuplicates: true },
      );
    fail(payError);
  },

  async cancelSubscription(userId) {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("assinaturas").update({ renovacao_automatica: false }).eq("user_id", userId);
    fail(error);
  },

  async getAdminMetrics() {
    const supabase = await createSupabaseServerClient();
    const monthAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const head = { count: "exact" as const, head: true };
    const [usuarios, clientes, profissionais, pendentes, ativas, avaliacoes, pagMes, pagTotal] = await Promise.all([
      supabase.from("users").select("id", head),
      supabase.from("users").select("id", head).eq("tipo", "cliente"),
      supabase.from("profissionais").select("user_id", head),
      supabase.from("profissionais").select("user_id", head).eq("aprovado", false),
      supabase.from("assinaturas").select("id", head).eq("status", "ativa"),
      supabase.from("avaliacoes").select("id", head),
      supabase.from("pagamentos").select("valor").gte("created_at", monthAgo),
      supabase.from("pagamentos").select("valor"),
    ]);
    const sum = (rows: { valor: unknown }[] | null) => (rows ?? []).reduce((s, r) => s + Number(r.valor), 0);
    return {
      usuarios: usuarios.count ?? 0,
      clientes: clientes.count ?? 0,
      profissionais: profissionais.count ?? 0,
      pendentes: pendentes.count ?? 0,
      assinaturasAtivas: ativas.count ?? 0,
      receitaMensal: sum(pagMes.data),
      receitaTotal: sum(pagTotal.data),
      avaliacoes: avaliacoes.count ?? 0,
    };
  },

  async listUsers(query) {
    const supabase = await createSupabaseServerClient();
    let q = supabase
      .from("users")
      .select("*, profissionais(profissao, aprovado, assinatura_ativa)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (query) {
      const safe = query.replace(/[%,()]/g, " ");
      q = q.or(`nome.ilike.%${safe}%,email.ilike.%${safe}%,cidade.ilike.%${safe}%`);
    }
    const { data, error } = await q;
    fail(error);
    return (data ?? []).map((u) => ({ ...u, profissional: u.profissionais ?? null })) as AdminUserRow[];
  },

  async listPendingProfessionals() {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profissionais")
      .select("profissao, aprovado, assinatura_ativa, users!inner(*)")
      .eq("aprovado", false)
      .order("created_at", { ascending: false });
    fail(error);
    return (data ?? []).map((p) => ({
      ...(p.users as unknown as AppUser),
      profissional: { profissao: p.profissao, aprovado: p.aprovado, assinatura_ativa: p.assinatura_ativa },
    }));
  },

  async setApproved(userId, approved) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("profissionais").update({ aprovado: approved }).eq("user_id", userId);
    fail(error);
  },

  async setBanned(userId, banned) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("users").update({ banido: banned }).eq("id", userId).neq("tipo", "admin");
    fail(error);
  },

  async listAllPayments(limit = 50) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("pagamentos")
      .select("*, users(nome)")
      .order("created_at", { ascending: false })
      .limit(limit);
    fail(error);
    return (data ?? []).map((p) => ({
      ...p,
      valor: Number(p.valor),
      user_nome: (p.users as unknown as { nome: string } | null)?.nome,
    })) as Payment[];
  },

  async addCategory(nome, icone) {
    const supabase = await createSupabaseServerClient();
    const slug = normalize(nome).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("categorias").insert({ nome, slug, icone });
    if (error?.code === "23505") throw new Error("Essa categoria já existe.");
    fail(error);
  },

  async toggleCategory(id, ativo) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("categorias").update({ ativo }).eq("id", id);
    fail(error);
  },
};
