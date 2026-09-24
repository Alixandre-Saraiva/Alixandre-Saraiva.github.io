import type {
  AdminMetrics,
  AdminUserRow,
  AppUser,
  Category,
  Payment,
  PaymentProvider,
  ProfessionalDetail,
  ProfessionalRecord,
  Review,
  SearchParams,
  SearchResult,
  Service,
  Subscription,
} from "@/lib/types";

export interface ProfileUpdate {
  nome?: string;
  cidade?: string | null;
  telefone?: string | null;
  foto?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface ProfessionalUpdate {
  profissao?: string;
  descricao?: string;
  categoria_id?: number | null;
  valor_medio?: number | null;
  whatsapp?: string | null;
}

export interface SubscriptionActivation {
  provider: PaymentProvider;
  providerRef: string | null;
  paymentRef?: string | null;
  valor: number;
  vencimento: Date;
}

export interface DashboardStats {
  visualizacoes: number;
  visualizacoes7d: number;
  nota: number;
  total_avaliacoes: number;
}

/**
 * Contrato de acesso a dados. Implementado pelo Supabase (produção) e por um
 * armazenamento em memória (modo demonstração).
 */
export interface Repository {
  // Usuário atual / perfil
  getCurrentUser(): Promise<AppUser | null>;
  updateUser(userId: string, data: ProfileUpdate): Promise<void>;
  uploadAvatar(userId: string, file: File): Promise<string>;

  // Catálogo
  listCategories(includeInactive?: boolean): Promise<Category[]>;
  searchProfessionals(params: SearchParams): Promise<SearchResult>;
  getProfessional(id: string, viewer?: { lat: number; lng: number } | null): Promise<ProfessionalDetail | null>;
  registerView(professionalId: string): Promise<void>;

  // Painel do profissional
  getProfessionalRecord(userId: string): Promise<ProfessionalRecord | null>;
  updateProfessional(userId: string, data: ProfessionalUpdate): Promise<void>;
  listServices(userId: string): Promise<Service[]>;
  addService(userId: string, titulo: string, preco: number | null): Promise<void>;
  removeService(userId: string, serviceId: string): Promise<void>;
  getDashboardStats(userId: string): Promise<DashboardStats>;

  // Avaliações
  listReviews(professionalId: string, limit?: number): Promise<Review[]>;
  upsertReview(professionalId: string, clienteId: string, nota: number, comentario: string | null): Promise<void>;

  // Assinatura
  getSubscription(userId: string): Promise<Subscription | null>;
  listPayments(userId: string): Promise<Payment[]>;
  activateSubscription(userId: string, data: SubscriptionActivation): Promise<void>;
  cancelSubscription(userId: string): Promise<void>;

  // Administração
  getAdminMetrics(): Promise<AdminMetrics>;
  listUsers(query?: string): Promise<AdminUserRow[]>;
  listPendingProfessionals(): Promise<AdminUserRow[]>;
  setApproved(userId: string, approved: boolean): Promise<void>;
  setBanned(userId: string, banned: boolean): Promise<void>;
  listAllPayments(limit?: number): Promise<Payment[]>;
  addCategory(nome: string, icone: string): Promise<void>;
  toggleCategory(id: number, ativo: boolean): Promise<void>;
}
