"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser, repo } from "@/lib/data";
import type { ActionResult } from "@/lib/types";

async function guard<T>(fn: () => Promise<T>, success: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (user?.tipo !== "admin") return { ok: false, message: "Acesso restrito ao administrador." };
  try {
    await fn();
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Falha ao executar a ação." };
  }
  revalidatePath("/admin");
  revalidatePath("/buscar");
  return { ok: true, message: success };
}

export async function setApproved(userId: string, approved: boolean) {
  return guard(() => repo.setApproved(userId, approved), approved ? "Profissional aprovado!" : "Aprovação removida.");
}

export async function setBanned(userId: string, banned: boolean) {
  return guard(() => repo.setBanned(userId, banned), banned ? "Usuário banido." : "Usuário reativado.");
}

export async function addCategory(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = z
    .object({ nome: z.string().trim().min(3, "Informe o nome da categoria."), icone: z.string().default("wrench") })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  return guard(() => repo.addCategory(parsed.data.nome, parsed.data.icone), "Categoria criada!");
}

export async function toggleCategory(id: number, ativo: boolean) {
  return guard(() => repo.toggleCategory(id, ativo), ativo ? "Categoria ativada." : "Categoria desativada.");
}
