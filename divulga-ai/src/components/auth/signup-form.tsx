"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Lock, Mail, MapPin, Phone, User, UserRound } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

export function SignupForm({ categories, defaultTipo }: { categories: Category[]; defaultTipo: "cliente" | "profissional" }) {
  const [tipo, setTipo] = useState(defaultTipo);
  const [state, action, pending] = useActionState(signUp, null);
  useActionFeedback(state);

  if (state?.ok) {
    return (
      <div className="rounded-[1.75rem] bg-surface p-8 text-center shadow-lift">
        <Mail className="mx-auto size-12 text-primary" />
        <h1 className="mt-4 text-xl font-semibold">Verifique seu e-mail</h1>
        <p className="mt-2 text-sm text-muted">{state.message}</p>
        <Link href="/login" className="mt-6 inline-block font-semibold text-primary">
          Ir para o login
        </Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] bg-surface p-6 shadow-lift sm:p-8">
      <h1 className="text-2xl font-semibold tracking-[0.12em] text-primary">Cadastro</h1>
      <p className="mt-1 text-sm text-muted">Crie sua conta gratuitamente.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1" role="tablist" aria-label="Tipo de conta">
        {(
          [
            ["cliente", "Quero contratar", UserRound],
            ["profissional", "Sou profissional", Briefcase],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tipo === value}
            onClick={() => setTipo(value)}
            className={cn("relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition", tipo === value ? "text-white" : "text-muted")}
          >
            {tipo === value && <motion.span layoutId="tipo-pill" className="absolute inset-0 rounded-xl bg-primary shadow-soft" />}
            <Icon className="relative size-4" />
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="tipo" value={tipo} />
        <Input name="nome" label="Nome completo" placeholder="José da Silva" autoComplete="name" icon={<User />} required />
        <Input name="email" type="email" label="E-mail" placeholder="voce@email.com" autoComplete="email" icon={<Mail />} required />
        <Input name="senha" type="password" label="Senha" placeholder="Mínimo 6 caracteres" autoComplete="new-password" icon={<Lock />} required minLength={6} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input name="cidade" label="Cidade" placeholder="Santa Inês" autoComplete="address-level2" icon={<MapPin />} required />
          <Input name="telefone" type="tel" label="Telefone / WhatsApp" placeholder="(98) 99999-9999" autoComplete="tel" icon={<Phone />} required />
        </div>

        <AnimatePresence initial={false}>
          {tipo === "profissional" && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-4 overflow-hidden">
              <Select name="categoria" label="Categoria principal" defaultValue="">
                <option value="" disabled>
                  Selecione…
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.nome}
                  </option>
                ))}
              </Select>
              <Input name="profissao" label="Profissão / especialidades" placeholder="Pedreiro, eletricista, encanador" icon={<Briefcase />} />
              <p className="rounded-xl bg-accent-100 px-4 py-3 text-xs text-[#5c4708] dark:bg-accent-700/20 dark:text-accent-300">
                Seu anúncio fica visível após a assinatura de <strong>R$ 5,00/mês</strong> e aprovação do perfil.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <Button type="submit" variant="accent" className="w-full" size="lg" loading={pending}>
          Cadastrar
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </motion.div>
  );
}
