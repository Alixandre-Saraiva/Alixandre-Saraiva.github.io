"use client";

import { useEffect } from "react";
import { registerView } from "@/actions/profile";

/** Conta uma visualização por perfil e por sessão do navegador. */
export function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    const key = `viewed:${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    registerView(id).catch(() => undefined);
  }, [id]);
  return null;
}
