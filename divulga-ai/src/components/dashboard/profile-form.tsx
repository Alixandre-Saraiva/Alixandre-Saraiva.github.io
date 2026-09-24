"use client";

import { useActionState } from "react";
import { updateProfessionalProfile } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useActionFeedback } from "@/hooks/use-action-feedback";
import type { AppUser, Category, ProfessionalRecord } from "@/lib/types";

export function ProfileForm({ user, pro, categories }: { user: AppUser; pro: ProfessionalRecord; categories: Category[] }) {
  const [state, action, pending] = useActionState(updateProfessionalProfile, null);
  useActionFeedback(state);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Input name="nome" label="Nome" defaultValue={user.nome} required />
      <Input name="profissao" label="Ocupações" defaultValue={pro.profissao} placeholder="Pedreiro, eletricista, encanador" required />
      <Select name="categoria_id" label="Categoria" defaultValue={pro.categoria_id ?? ""}>
        <option value="">Selecione…</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </Select>
      <Input name="cidade" label="Localização (cidade)" defaultValue={user.cidade ?? ""} required />
      <Input name="telefone" type="tel" label="Telefone" defaultValue={user.telefone ?? ""} />
      <Input name="whatsapp" type="tel" label="WhatsApp para contato" defaultValue={pro.whatsapp ?? ""} placeholder="(98) 99999-9999" />
      <Input name="valor_medio" inputMode="decimal" label="Valor médio (R$)" defaultValue={pro.valor_medio?.toString().replace(".", ",") ?? ""} placeholder="150,00" hint="Aparece como “a partir de” nos cards." />
      <div className="sm:col-span-2">
        <Textarea name="descricao" label="Descrição" defaultValue={pro.descricao} maxLength={1000} placeholder="Conte sua experiência, região que atende, diferenciais…" className="min-h-36" />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" loading={pending}>
          Salvar perfil
        </Button>
      </div>
    </form>
  );
}
