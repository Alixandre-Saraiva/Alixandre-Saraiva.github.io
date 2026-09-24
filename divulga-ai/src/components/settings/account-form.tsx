"use client";

import { MapPin, Phone, User } from "lucide-react";
import { useActionState } from "react";
import { updateAccount } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import type { AppUser } from "@/lib/types";

export function AccountForm({ user }: { user: AppUser }) {
  const [state, action, pending] = useActionState(updateAccount, null);
  useActionFeedback(state);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input name="nome" label="Nome" defaultValue={user.nome} icon={<User />} required />
      </div>
      <Input name="cidade" label="Cidade" defaultValue={user.cidade ?? ""} icon={<MapPin />} required />
      <Input name="telefone" type="tel" label="Telefone" defaultValue={user.telefone ?? ""} icon={<Phone />} />
      <div className="sm:col-span-2">
        <Input label="E-mail" value={user.email} disabled readOnly />
      </div>
      <div>
        <Button type="submit" loading={pending}>
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
