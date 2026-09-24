"use client";

import { CalendarDays, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import type { ProfessionalDetail } from "@/lib/types";
import { formatCurrency, whatsappLink } from "@/lib/utils";

/**
 * Modal de contratação. Nesta fase o pedido segue pelo WhatsApp com uma
 * mensagem pronta; o chat interno usará as tabelas `conversas`/`mensagens`.
 */
export function HireButton({ pro, className }: { pro: ProfessionalDetail; className?: string }) {
  const [open, setOpen] = useState(false);
  const [servico, setServico] = useState(pro.servicos[0]?.titulo ?? "");
  const [data, setData] = useState("");
  const [detalhes, setDetalhes] = useState("");

  const message = [
    `Olá, ${pro.nome.split(" ")[0]}! Encontrei seu perfil no Divulga ai.`,
    servico && `Tenho interesse em: ${servico}.`,
    data && `Data desejada: ${new Date(`${data}T12:00`).toLocaleDateString("pt-BR")}.`,
    detalhes && `Detalhes: ${detalhes}`,
  ]
    .filter(Boolean)
    .join("\n");

  const link = whatsappLink(pro.whatsapp, message);

  return (
    <>
      <Button variant="accent" size="lg" className={className} onClick={() => setOpen(true)}>
        Quero contratar!
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Contratar ${pro.nome.split(" ")[0]}`}>
        <div className="space-y-4">
          {pro.servicos.length > 0 ? (
            <Select label="Serviço" value={servico} onChange={(e) => setServico(e.target.value)} name="servico">
              {pro.servicos.map((s) => (
                <option key={s.id} value={s.titulo}>
                  {s.titulo} — {formatCurrency(s.preco)}
                </option>
              ))}
              <option value="Outro serviço">Outro serviço</option>
            </Select>
          ) : (
            <Input label="Serviço" value={servico} onChange={(e) => setServico(e.target.value)} name="servico" placeholder="O que você precisa?" />
          )}
          <Input label="Quando?" type="date" name="data" value={data} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setData(e.target.value)} icon={<CalendarDays />} />
          <Textarea label="Descreva o serviço (opcional)" name="detalhes" value={detalhes} onChange={(e) => setDetalhes(e.target.value)} placeholder="Ex.: trocar 3 tomadas na cozinha" maxLength={400} />

          <div className="rounded-2xl bg-surface-2 p-4 text-sm">
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">Prévia da mensagem</p>
            <p className="whitespace-pre-line">{message}</p>
          </div>

          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] font-semibold text-white shadow-soft transition hover:brightness-95 active:scale-[0.98]"
            >
              <MessageCircle className="size-5" /> Enviar pelo WhatsApp
            </a>
          ) : (
            <p className="text-center text-sm text-muted">Este profissional ainda não informou um WhatsApp.</p>
          )}
        </div>
      </Modal>
    </>
  );
}
