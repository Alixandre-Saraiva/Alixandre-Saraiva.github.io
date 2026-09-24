"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser, repo } from "@/lib/data";
import type { ActionResult } from "@/lib/types";

const optionalMoney = z
  .string()
  .optional()
  .transform((v) => {
    if (!v) return null;
    const n = Number(v.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) && n >= 0 ? n : null;
  });

const accountSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo."),
  cidade: z.string().trim().min(2, "Informe sua cidade."),
  telefone: z.string().trim().optional(),
});

const professionalSchema = accountSchema.extend({
  profissao: z.string().trim().min(3, "Informe sua profissão."),
  descricao: z.string().trim().max(1000, "A descrição pode ter até 1000 caracteres.").default(""),
  categoria_id: z.coerce.number().int().positive().nullable().catch(null),
  valor_medio: optionalMoney,
  whatsapp: z.string().trim().optional(),
});

function error(e: unknown): ActionResult {
  return { ok: false, message: e instanceof Error ? e.message : "Algo deu errado. Tente novamente." };
}

export async function updateAccount(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Faça login novamente." };
  const parsed = accountSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  try {
    await repo.updateUser(user.id, { ...parsed.data, telefone: parsed.data.telefone || null });
  } catch (e) {
    return error(e);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Dados atualizados!" };
}

export async function updateProfessionalProfile(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.tipo !== "profissional") return { ok: false, message: "Acesso restrito a profissionais." };
  const parsed = professionalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { nome, cidade, telefone, ...pro } = parsed.data;
  try {
    await repo.updateUser(user.id, { nome, cidade, telefone: telefone || null });
    await repo.updateProfessional(user.id, { ...pro, whatsapp: pro.whatsapp || telefone || null });
  } catch (e) {
    return error(e);
  }
  revalidatePath("/painel");
  revalidatePath(`/profissional/${user.id}`);
  return { ok: true, message: "Perfil salvo!" };
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Faça login novamente." };
  const file = formData.get("foto");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Selecione uma imagem." };
  if (!file.type.startsWith("image/")) return { ok: false, message: "O arquivo precisa ser uma imagem." };
  try {
    await repo.uploadAvatar(user.id, file);
  } catch (e) {
    return error(e);
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Foto atualizada!" };
}

export async function addService(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || user.tipo !== "profissional") return { ok: false, message: "Acesso restrito a profissionais." };
  const parsed = z
    .object({ titulo: z.string().trim().min(3, "Descreva o serviço.").max(80), preco: optionalMoney })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  try {
    await repo.addService(user.id, parsed.data.titulo, parsed.data.preco);
  } catch (e) {
    return error(e);
  }
  revalidatePath("/painel");
  return { ok: true, message: "Serviço adicionado!" };
}

export async function removeService(serviceId: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Faça login novamente." };
  try {
    await repo.removeService(user.id, serviceId);
  } catch (e) {
    return error(e);
  }
  revalidatePath("/painel");
  return { ok: true, message: "Serviço removido." };
}

/** Salva a localização detectada no perfil do usuário logado. */
export async function saveLocation(lat: number, lng: number, cidade: string | null): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await repo.updateUser(user.id, { lat, lng, ...(cidade && !user.cidade ? { cidade } : {}) });
}

export async function registerView(professionalId: string): Promise<void> {
  if (!z.uuid().safeParse(professionalId).success) return;
  await repo.registerView(professionalId);
}
