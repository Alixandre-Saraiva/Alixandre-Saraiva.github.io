import { UserX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <EmptyState
      icon={<UserX />}
      title="Profissional indisponível"
      text="Este perfil não existe ou o anúncio está pausado no momento."
      action={<ButtonLink href="/buscar">Ver outros profissionais</ButtonLink>}
    />
  );
}
