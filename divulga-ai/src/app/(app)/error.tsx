"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <EmptyState
      icon={<TriangleAlert />}
      title="Algo deu errado"
      text="Não conseguimos carregar esta página. Verifique sua conexão e tente de novo."
      action={
        <Button onClick={reset}>
          <RefreshCw className="size-4" /> Tentar novamente
        </Button>
      }
    />
  );
}
