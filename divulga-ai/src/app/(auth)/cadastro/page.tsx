import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { homeFor } from "@/lib/auth";
import { getCurrentUser, repo } from "@/lib/data";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Cadastre-se no Divulga ai para contratar profissionais ou divulgar seus serviços.",
};

export default async function SignupPage({ searchParams }: PageProps<"/cadastro">) {
  const [sp, user, categories] = await Promise.all([searchParams, getCurrentUser(), repo.listCategories()]);
  if (user) redirect(homeFor(user));
  return <SignupForm categories={categories} defaultTipo={sp.tipo === "profissional" ? "profissional" : "cliente"} />;
}
