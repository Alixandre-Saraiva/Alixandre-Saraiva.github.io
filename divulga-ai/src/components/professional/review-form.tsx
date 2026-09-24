"use client";

import { useActionState, useRef } from "react";
import { submitReview } from "@/actions/reviews";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { StarInput } from "@/components/ui/stars";
import { useActionFeedback } from "@/hooks/use-action-feedback";

export function ReviewForm({ professionalId }: { professionalId: string }) {
  const [state, action, pending] = useActionState(submitReview, null);
  const formRef = useRef<HTMLFormElement>(null);
  useActionFeedback(state, { onSuccess: () => formRef.current?.reset() });

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-2xl border border-line bg-surface-2/60 p-4">
      <p className="font-semibold">Avalie este profissional</p>
      <input type="hidden" name="profissional_id" value={professionalId} />
      <StarInput name="nota" />
      <Textarea name="comentario" placeholder="Conte como foi o serviço (opcional)" maxLength={500} className="min-h-20 bg-surface" />
      <Button type="submit" size="sm" loading={pending}>
        Publicar avaliação
      </Button>
    </form>
  );
}
