/**
 * Configuração de ambiente. Sem as variáveis do Supabase o app roda em
 * "modo demonstração": dados de exemplo em memória e login simulado, para que
 * seja possível navegar por todas as telas sem configurar nada.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const isDemoMode = !isSupabaseEnabled;

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const isStripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);
export const isMercadoPagoEnabled = Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);

export const SUBSCRIPTION_PRICE = 5;
