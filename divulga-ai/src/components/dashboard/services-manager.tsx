"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useActionState, useRef, useTransition } from "react";
import { addService, removeService } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import type { Service } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ServicesManager({ services }: { services: Service[] }) {
  const [state, action, pending] = useActionState(addService, null);
  const form = useRef<HTMLFormElement>(null);
  const [removing, start] = useTransition();
  const toast = useToast();
  useActionFeedback(state, { onSuccess: () => form.current?.reset() });

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {services.map((s) => (
            <motion.li
              key={s.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
            >
              <span className="min-w-0 truncate text-sm font-medium">{s.titulo}</span>
              <span className="ml-auto shrink-0 text-sm font-semibold text-primary">{formatCurrency(s.preco)}</span>
              <button
                type="button"
                disabled={removing}
                onClick={() =>
                  start(async () => {
                    const res = await removeService(s.id);
                    toast(res.message ?? "", res.ok ? "success" : "error");
                  })
                }
                className="rounded-full p-2 text-muted transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30"
                aria-label={`Remover ${s.titulo}`}
              >
                <Trash2 className="size-4" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
        {services.length === 0 && <li className="rounded-2xl border border-dashed border-line p-4 text-center text-sm text-muted">Nenhum serviço cadastrado ainda.</li>}
      </ul>

      <form ref={form} action={action} className="flex flex-col gap-2 sm:flex-row">
        <input name="titulo" required minLength={3} maxLength={80} placeholder="Novo serviço (ex.: Instalação de chuveiro)" className="h-11 flex-1 rounded-2xl border border-line bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15" />
        <input name="preco" inputMode="decimal" placeholder="Preço (R$)" className="h-11 rounded-2xl border border-line bg-surface px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 sm:w-36" />
        <Button type="submit" size="md" loading={pending}>
          <Plus className="size-4" /> Adicionar
        </Button>
      </form>
    </div>
  );
}
