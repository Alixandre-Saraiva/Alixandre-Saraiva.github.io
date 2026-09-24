"use client";

import { motion } from "framer-motion";
import { Info, Star, Wrench } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "avaliacoes", label: "Avaliações", icon: Star },
  { id: "servicos", label: "Serviços", icon: Wrench },
  { id: "sobre", label: "Sobre", icon: Info },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProfileTabs({ panels }: { panels: Record<TabId, ReactNode> }) {
  const [tab, setTab] = useState<TabId>("avaliacoes");
  return (
    <div>
      <div className="grid grid-cols-3 border-b border-line" role="tablist">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn("relative flex flex-col items-center gap-1 py-3 text-xs font-medium transition sm:flex-row sm:justify-center sm:gap-2 sm:text-sm", tab === id ? "text-primary" : "text-muted hover:text-ink")}
          >
            <Icon className={cn("size-5", tab === id && "fill-accent text-accent")} />
            {label}
            {tab === id && <motion.span layoutId="profile-tab" className="absolute inset-x-6 -bottom-px h-0.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="pt-5" role="tabpanel">
        {panels[tab]}
      </motion.div>
    </div>
  );
}
