"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { homeFor } from "@/lib/auth";
import { DEMO_SESSION_COOKIE, demoDB } from "@/lib/demo/store";
import { isSupabaseEnabled, SITE_URL } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult, AppUser } from "@/lib/types";

const loginSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  next: z.string().optional(),
});

const signupSchema = z
  .object({
    tipo: z.enum(["cliente", "profissional"]),
    nome: z.string().trim().min(3, "Informe seu nome completo."),
    email: z.email("Informe um e-mail válido."),
    senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
    cidade: z.string().trim().min(2, "Informe sua cidade."),
    telefone: z.string().trim().min(10, "Informe um telefone com DDD."),
    profissao: z.string().trim().optional(),
    categoria: z.string().optional(),
  })
  .refine((d) => d.tipo === "cliente" || (d.profissao && d.profissao.length >= 3), {
    message: "Informe sua profissão.",
    path: ["profissao"],
  });

/** Evita redirecionamentos para outros domínios. */
function safeNext(next: string | undefined | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : SITE_URL;
}

async function startDemoSession(userId: string) {
  (await cookies()).set(DEMO_SESSION_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function signIn(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { email, senha, next } = parsed.data;

  let user: Pick<AppUser, "tipo">;
  if (isSupabaseEnabled) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error || !data.user) return { ok: false, message: "E-mail ou senha incorretos." };
    const { data: profile } = await supabase.from("users").select("tipo, banido").eq("id", data.user.id).single();
    if (profile?.banido) {
      await supabase.auth.signOut();
      return { ok: false, message: "Sua conta está suspensa. Fale com o suporte." };
    }
    user = { tipo: profile?.tipo ?? "cliente" };
  } else {
    const found = demoDB().users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha);
    if (!found) return { ok: false, message: "E-mail ou senha incorretos." };
    if (found.banido) return { ok: false, message: "Sua conta está suspensa. Fale com o suporte." };
    await startDemoSession(found.id);
    user = found;
  }

  redirect(safeNext(next) ?? homeFor(user));
}

export async function signUp(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const d = parsed.data;

  if (isSupabaseEnabled) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: d.email,
      password: d.senha,
      options: {
        emailRedirectTo: `${await siteOrigin()}/auth/callback`,
        data: { nome: d.nome, tipo: d.tipo, cidade: d.cidade, telefone: d.telefone, profissao: d.profissao, categoria: d.categoria },
      },
    });
    if (error) {
      return { ok: false, message: error.message.includes("registered") ? "Este e-mail já está cadastrado." : error.message };
    }
    if (!data.session) {
      return { ok: true, message: "Conta criada! Confirme seu e-mail pelo link que enviamos para entrar." };
    }
  } else {
    const db = demoDB();
    if (db.users.some((u) => u.email.toLowerCase() === d.email.toLowerCase())) {
      return { ok: false, message: "Este e-mail já está cadastrado." };
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.users.push({
      id,
      nome: d.nome,
      email: d.email,
      senha: d.senha,
      tipo: d.tipo,
      cidade: d.cidade,
      telefone: d.telefone,
      foto: null,
      lat: null,
      lng: null,
      banido: false,
      created_at: now,
    });
    if (d.tipo === "profissional") {
      db.profissionais.push({
        user_id: id,
        profissao: d.profissao ?? "",
        descricao: "",
        categoria_id: db.categorias.find((c) => c.slug === d.categoria)?.id ?? null,
        nota: 0,
        total_avaliacoes: 0,
        valor_medio: null,
        whatsapp: d.telefone,
        assinatura_ativa: false,
        aprovado: true, // no modo demo o admin aprova automaticamente
        visualizacoes: 0,
        created_at: now,
      });
    }
    await startDemoSession(id);
  }

  redirect(d.tipo === "profissional" ? "/assinatura?bemvindo=1" : "/");
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeNext(formData.get("next") as string | null) ?? "/";
  if (!isSupabaseEnabled) redirect(`/login?erro=google-demo`);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?erro=google");
  redirect(data.url);
}

export async function signOut() {
  if (isSupabaseEnabled) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } else {
    (await cookies()).delete(DEMO_SESSION_COOKIE);
  }
  redirect("/login");
}
