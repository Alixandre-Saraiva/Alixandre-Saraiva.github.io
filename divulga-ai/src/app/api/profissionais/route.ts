import { NextResponse, type NextRequest } from "next/server";
import { getUserLocation, repo } from "@/lib/data";
import type { SortOrder } from "@/lib/types";

const ORDERS: SortOrder[] = ["avaliacao", "proximos", "recentes"];

/** Busca paginada — usada pelo infinite scroll. */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const location = await getUserLocation();
  const ordem = ORDERS.includes(sp.get("ordem") as SortOrder) ? (sp.get("ordem") as SortOrder) : "avaliacao";
  const result = await repo.searchProfessionals({
    q: sp.get("q") ?? undefined,
    cidade: sp.get("cidade") ?? undefined,
    categoria: sp.get("categoria") ?? undefined,
    ordem,
    lat: location?.lat,
    lng: location?.lng,
    page: Math.max(0, Number(sp.get("page") ?? 0) || 0),
  });
  return NextResponse.json(result);
}
