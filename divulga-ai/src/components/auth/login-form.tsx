"use client";

import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { signIn, signInWithGoogle } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionFeedback } from "@/hooks/use-action-feedback";

export function LoginForm({ next, demo, error }: { next?: string; demo: boolean; error?: string }) {
  const [state, action, pending] = useActionState(signIn, null);
  useActionFeedback(state);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.75rem] bg-surface p-6 shadow-lift sm:p-8">
      <h1 className="text-center text-3xl font-semibold tracking-[0.2em] text-primary">LOGIN</h1>
      <p className="mt-2 text-center text-sm text-muted">Que bom ter você de volta!</p>

      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {error === "google-demo" ? "O login com Google fica disponível após configurar o Supabase." : "Não foi possível concluir o login. Tente novamente."}
        </p>
      )}

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next ?? ""} />
        <Input name="email" type="email" label="E-mail" placeholder="voce@email.com" autoComplete="email" icon={<Mail />} required />
        <Input name="senha" type="password" label="Senha" placeholder="••••••" autoComplete="current-password" icon={<Lock />} required minLength={6} />
        <Button type="submit" className="w-full" size="lg" loading={pending}>
          Entrar
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-line" /> ou <span className="h-px flex-1 bg-line" />
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next ?? ""} />
        <Button type="submit" variant="outline" className="w-full" size="lg">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
            <path fill="#4285F4" d="M22.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.3-4.7 3.3-7.9Z" />
            <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.7-2.8Z" />
            <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4Z" />
          </svg>
          Entrar com Google
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem cadastro?{" "}
        <Link href="/cadastro" className="font-semibold text-primary hover:underline">
          Criar conta
        </Link>
      </p>

      {demo && (
        <div className="mt-6 rounded-2xl bg-accent-100 p-4 text-xs text-[#5c4708] dark:bg-accent-700/20 dark:text-accent-300">
          <p className="font-semibold">Contas de demonstração (senha 123456)</p>
          <ul className="mt-1 space-y-0.5">
            <li>cliente@divulgaai.com — cliente</li>
            <li>profissional@divulgaai.com — profissional</li>
            <li>admin@divulgaai.com — administrador</li>
          </ul>
        </div>
      )}
    </motion.div>
  );
}
