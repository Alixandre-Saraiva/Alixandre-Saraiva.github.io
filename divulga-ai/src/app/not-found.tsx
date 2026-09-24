import Link from "next/link";
import { LogoMark } from "@/components/layout/logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-primary px-6 text-center text-white">
      <LogoMark className="size-20" />
      <h1 className="mt-6 text-3xl font-semibold">Página não encontrada</h1>
      <p className="mt-2 text-white/80">O endereço que você procurou não existe ou foi removido.</p>
      <Link href="/" className="mt-6 rounded-full bg-accent px-6 py-3 font-semibold text-[#222]">
        Voltar ao início
      </Link>
    </main>
  );
}
