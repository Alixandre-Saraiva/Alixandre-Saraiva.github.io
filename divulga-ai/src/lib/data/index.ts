import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { isSupabaseEnabled } from "@/lib/env";
import { LOCATION_COOKIE, parseLocationCookie } from "@/lib/geo";
import { demoRepository } from "./demo-repository";
import type { Repository } from "./repository";
import { supabaseRepository } from "./supabase-repository";

export type { Repository } from "./repository";

export const repo: Repository = isSupabaseEnabled ? supabaseRepository : demoRepository;

/** Usuário logado (memoizado por requisição). */
export const getCurrentUser = cache(() => repo.getCurrentUser());

/** Localização salva pelo navegador (cookie definido após o GPS). */
export const getUserLocation = cache(async () => parseLocationCookie((await cookies()).get(LOCATION_COOKIE)?.value));
