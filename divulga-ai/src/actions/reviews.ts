"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser, repo } from "@/lib/data";
import type { ActionResult } from "@/lib/types";

const schema = z.object({
  profissional_id: z.string().min(1),
  nota: z.coerce.number().int().min(1, "Escolha de 1 a 5 estrelas.").max(5),
  comentario: z.string().trim().max(500, "O comentário pode ter até 500 caracteres.").optional(),
});

export async function submitReview(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Entre na sua conta para avaliar." };
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { profissional_id, nota, comentario } = parsed.data;
  if (profissional_id === user.id) return { ok: false, message: "Você não pode avaliar o próprio perfil." };

  try {
    await repo.upsertReview(profissional_id, user.id, nota, comentario || null);
  } catch {
    return { ok: false, message: "Não foi possível salvar sua avaliação." };
  }
  revalidatePath(`/profissional/${profissional_id}`);
  return { ok: true, message: "Obrigado pela avaliação!" };
}
