import Link from "next/link";
import { Logo, LogoMark } from "@/components/layout/logo";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-primary p-12 text-white lg:flex lg:flex-col">
        <Link href="/">
          <Logo light />
        </Link>
        <div className="my-auto max-w-md">
          <LogoMark className="mb-8 size-20" />
          <h1 className="text-4xl font-semibold leading-tight">
            Seu serviço, <span className="text-accent">visto</span> por quem precisa.
          </h1>
          <p className="mt-4 text-white/80">
            Clientes encontram profissionais avaliados perto de casa. Profissionais divulgam seu trabalho por apenas R$ 5 por mês.
          </p>
        </div>
        <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-white/10" />
        <div className="absolute -right-10 top-20 size-40 rounded-full bg-accent/20" />
      </section>
      <section className="flex flex-col bg-primary px-5 py-8 lg:bg-bg lg:px-12">
        <div className="mb-8 lg:hidden">
          <Link href="/">
            <Logo light />
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-md">{children}</div>
      </section>
    </div>
  );
}
