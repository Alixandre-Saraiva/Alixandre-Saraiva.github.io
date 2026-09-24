import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { homeFor } from "@/lib/auth";
import { getCurrentUser } from "@/lib/data";
import { isDemoMode } from "@/lib/env";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user));
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const erro = typeof sp.erro === "string" ? sp.erro : undefined;
  return <LoginForm next={next} demo={isDemoMode} error={erro} />;
}
