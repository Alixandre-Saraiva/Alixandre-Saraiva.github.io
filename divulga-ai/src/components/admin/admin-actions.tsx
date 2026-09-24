"use client";

import { Ban, Check, RotateCcw, X } from "lucide-react";
import { useTransition } from "react";
import { setApproved, setBanned, toggleCategory } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/types";

function useRun() {
  const [pending, start] = useTransition();
  const toast = useToast();
  const run = (fn: () => Promise<ActionResult>) =>
    start(async () => {
      const res = await fn();
      toast(res.message ?? "", res.ok ? "success" : "error");
    });
  return { pending, run };
}

export function ApprovalButtons({ userId }: { userId: string }) {
  const { pending, run } = useRun();
  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={pending} onClick={() => run(() => setApproved(userId, true))}>
        <Check className="size-4" /> Aprovar
      </Button>
      <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setBanned(userId, true))}>
        <X className="size-4" /> Recusar
      </Button>
    </div>
  );
}

export function BanButton({ userId, banned }: { userId: string; banned: boolean }) {
  const { pending, run } = useRun();
  return banned ? (
    <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setBanned(userId, false))}>
      <RotateCcw className="size-4" /> Reativar
    </Button>
  ) : (
    <Button size="sm" variant="ghost" className="text-red-500" disabled={pending} onClick={() => run(() => setBanned(userId, true))}>
      <Ban className="size-4" /> Banir
    </Button>
  );
}

export function CategoryToggle({ id, ativo }: { id: number; ativo: boolean }) {
  const { pending, run } = useRun();
  return (
    <button
      role="switch"
      aria-checked={ativo}
      disabled={pending}
      onClick={() => run(() => toggleCategory(id, !ativo))}
      className={`relative h-6 w-11 rounded-full transition ${ativo ? "bg-primary" : "bg-line"}`}
      aria-label={ativo ? "Desativar categoria" : "Ativar categoria"}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${ativo ? "left-[1.375rem]" : "left-0.5"}`} />
    </button>
  );
}
