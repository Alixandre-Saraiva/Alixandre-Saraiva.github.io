"use client";

import { Plus } from "lucide-react";
import { useActionState, useRef } from "react";
import { addCategory } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { CATEGORY_ICONS } from "@/components/ui/category-icon";
import { useActionFeedback } from "@/hooks/use-action-feedback";

export function CategoryForm() {
  const [state, action, pending] = useActionState(addCategory, null);
  const form = useRef<HTMLFormElement>(null);
  useActionFeedback(state, { onSuccess: () => form.current?.reset() });

  return (
    <form ref={form} action={action} className="flex flex-col gap-2 sm:flex-row">
      <input name="nome" required minLength={3} placeholder="Nova categoria (ex.: Marceneiro)" className="h-11 flex-1 rounded-2xl border border-line bg-surface px-4 text-sm outline-none focus:border-primary" />
      <select name="icone" className="h-11 rounded-2xl border border-line bg-surface px-3 text-sm outline-none focus:border-primary" defaultValue="wrench" aria-label="Ícone">
        {Object.keys(CATEGORY_ICONS).map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
      <Button type="submit" loading={pending}>
        <Plus className="size-4" /> Criar
      </Button>
    </form>
  );
}
