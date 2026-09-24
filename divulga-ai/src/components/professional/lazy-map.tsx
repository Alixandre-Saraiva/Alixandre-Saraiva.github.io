"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

/** Leaflet depende de `window`: carregado só no navegador e sob demanda. */
export const LazyMap = dynamic(() => import("./map-view"), {
  ssr: false,
  loading: () => <Skeleton className="h-[60vh] w-full rounded-[var(--radius-card)]" />,
});
