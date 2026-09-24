"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Stars } from "@/components/ui/stars";
import type { ProfessionalSummary } from "@/lib/types";
import { cn, formatCurrency, formatDistance } from "@/lib/utils";

export function ProfessionalCard({ pro, index = 0, compact }: { pro: ProfessionalSummary; index?: number; compact?: boolean }) {
  const distance = formatDistance(pro.distancia_km);
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.3 }}
      whileHover={{ y: -3 }}
      className="h-full"
    >
      <Link
        href={`/profissional/${pro.id}`}
        className={cn(
          "group flex h-full gap-4 rounded-[var(--radius-card)] border border-line/70 bg-surface p-4 shadow-soft transition-shadow hover:shadow-lift",
          compact ? "w-64 shrink-0 flex-col" : "items-start",
        )}
      >
        <div className={cn("flex gap-3", compact ? "items-center" : "contents")}>
          <Avatar src={pro.foto} name={pro.nome} size={compact ? "md" : "lg"} />
          {compact && (
            <div className="min-w-0">
              <p className="truncate font-semibold group-hover:text-primary">{pro.nome}</p>
              <p className="truncate text-xs text-muted">{pro.profissao}</p>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          {!compact && (
            <>
              <p className="truncate font-semibold group-hover:text-primary">{pro.nome}</p>
              <p className="truncate text-sm text-muted">{pro.profissao}</p>
            </>
          )}
          <Stars value={pro.nota} showValue count={pro.total_avaliacoes} className={compact ? "" : "mt-1.5"} />
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            {pro.cidade && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {pro.cidade}
              </span>
            )}
            {distance && (
              <span className="inline-flex items-center gap-1 text-primary">
                <Navigation className="size-3.5" /> {distance}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm">
            <span className="text-muted">a partir de </span>
            <span className="font-semibold text-primary">{formatCurrency(pro.valor_medio)}</span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProfessionalCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-[var(--radius-card)] border border-line/70 bg-surface p-4">
      <Skeleton className="size-20 rounded-full" />
      <div className="flex-1 space-y-2.5 pt-1">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
