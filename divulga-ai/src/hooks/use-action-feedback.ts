"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import type { ActionResult } from "@/lib/types";

/** Mostra o resultado de uma server action como toast e segue redirecionamentos. */
export function useActionFeedback(state: ActionResult | null, options: { onSuccess?: () => void } = {}) {
  const toast = useToast();
  const router = useRouter();
  const last = useRef<ActionResult | null>(null);
  const { onSuccess } = options;

  useEffect(() => {
    if (!state || state === last.current) return;
    last.current = state;
    if (state.message) toast(state.message, state.ok ? "success" : "error");
    if (state.ok) onSuccess?.();
    if (state.redirectTo) {
      if (/^https?:\/\//.test(state.redirectTo)) window.location.href = state.redirectTo;
      else router.push(state.redirectTo);
    }
  }, [state, toast, router, onSuccess]);
}
