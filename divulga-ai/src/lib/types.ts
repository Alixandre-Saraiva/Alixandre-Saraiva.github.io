export type UserRole = "cliente" | "profissional" | "admin";

export type SubscriptionStatus = "pendente" | "ativa" | "vencida" | "cancelada";

export type PaymentProvider = "stripe" | "mercadopago" | "demo";

export type SortOrder = "avaliacao" | "proximos" | "recentes";

export interface AppUser {
  id: string;
  nome: string;
  email: string;
  tipo: UserRole;
  cidade: string | null;
  telefone: string | null;
  foto: string | null;
  lat: number | null;
  lng: number | null;
  banido: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  slug: string;
  nome: string;
  icone: string;
  ativo: boolean;
}

export interface Service {
  id: string;
  titulo: string;
  preco: number | null;
}

export interface ProfessionalSummary {
  id: string;
  nome: string;
  foto: string | null;
  cidade: string | null;
  lat: number | null;
  lng: number | null;
  profissao: string;
  nota: number;
  total_avaliacoes: number;
  valor_medio: number | null;
  created_at: string;
  categoria_slug: string | null;
  categoria_nome: string | null;
  distancia_km: number | null;
}

export interface ProfessionalDetail extends ProfessionalSummary {
  descricao: string;
  whatsapp: string | null;
  visualizacoes: number;
  servicos: Service[];
}

/** Linha completa de um profissional, usada no painel e no admin. */
export interface ProfessionalRecord {
  user_id: string;
  profissao: string;
  descricao: string;
  categoria_id: number | null;
  nota: number;
  total_avaliacoes: number;
  valor_medio: number | null;
  whatsapp: string | null;
  assinatura_ativa: boolean;
  aprovado: boolean;
  visualizacoes: number;
  created_at: string;
}

export interface Review {
  id: string;
  profissional_id: string;
  cliente_id: string;
  cliente_nome: string;
  cliente_foto: string | null;
  nota: number;
  comentario: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  valor: number;
  vencimento: string | null;
  provider: PaymentProvider | null;
  provider_ref: string | null;
  renovacao_automatica: boolean;
}

export interface Payment {
  id: string;
  user_id: string;
  user_nome?: string;
  valor: number;
  status: string;
  provider: PaymentProvider;
  provider_ref: string | null;
  created_at: string;
}

export interface SearchParams {
  q?: string;
  cidade?: string;
  categoria?: string;
  ordem?: SortOrder;
  lat?: number | null;
  lng?: number | null;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  items: ProfessionalSummary[];
  hasMore: boolean;
}

export interface AdminMetrics {
  usuarios: number;
  clientes: number;
  profissionais: number;
  pendentes: number;
  assinaturasAtivas: number;
  receitaMensal: number;
  receitaTotal: number;
  avaliacoes: number;
}

export interface AdminUserRow extends AppUser {
  profissional?: Pick<ProfessionalRecord, "profissao" | "aprovado" | "assinatura_ativa"> | null;
}

export interface ActionResult {
  ok: boolean;
  message?: string;
  redirectTo?: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  cidade: string | null;
}
