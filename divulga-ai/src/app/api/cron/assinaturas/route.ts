import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseEnabled } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Rotina diária (Vercel Cron, ver vercel.json): marca assinaturas vencidas,
 * o que tira os anúncios correspondentes da busca.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseEnabled) return NextResponse.json({ expired: 0, demo: true });

  const { data, error } = await createSupabaseAdminClient().rpc("expire_subscriptions");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ expired: data });
}
