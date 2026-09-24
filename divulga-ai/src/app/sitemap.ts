import type { MetadataRoute } from "next";
import { repo } from "@/lib/data";
import { SITE_URL } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, pros] = await Promise.all([
    repo.listCategories().catch(() => []),
    repo.searchProfessionals({ ordem: "recentes", pageSize: 50 }).catch(() => ({ items: [] })),
  ]);
  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/buscar`, changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({ url: `${SITE_URL}/buscar?categoria=${c.slug}`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...pros.items.map((p) => ({ url: `${SITE_URL}/profissional/${p.id}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
