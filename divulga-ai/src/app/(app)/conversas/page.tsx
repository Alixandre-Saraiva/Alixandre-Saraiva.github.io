import { MessageCircle, Search } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Conversas", robots: { index: false } };

/**
 * O chat interno usa as tabelas `conversas` e `mensagens` (já criadas, com RLS).
 * Por enquanto o contato acontece pelo WhatsApp do profissional.
 */
export default async function ConversationsPage() {
  await requireUser("/conversas");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Conversas</h1>
      <EmptyState
        icon={<MessageCircle />}
        title="Chat interno em breve"
        text="Por enquanto, fale com os profissionais direto pelo WhatsApp usando o botão “Quero contratar!” no perfil de cada um."
        action={
          <ButtonLink href="/buscar">
            <Search className="size-4" /> Encontrar profissionais
          </ButtonLink>
        }
      />
    </div>
  );
}
