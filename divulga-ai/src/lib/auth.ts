import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";
import type { AppUser, UserRole } from "@/lib/types";

export function homeFor(user: Pick<AppUser, "tipo">) {
  if (user.tipo === "admin") return "/admin";
  if (user.tipo === "profissional") return "/painel";
  return "/";
}

/** Garante que existe um usuário logado; senão manda para o login. */
export async function requireUser(next = "/"): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireRole(role: UserRole | UserRole[], next = "/"): Promise<AppUser> {
  const user = await requireUser(next);
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.tipo) && user.tipo !== "admin") redirect(homeFor(user));
  return user;
}
