import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser, getUserLocation } from "@/lib/data";
import { isDemoMode } from "@/lib/env";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, location] = await Promise.all([getCurrentUser(), getUserLocation()]);
  const cidade = location?.cidade ?? user?.cidade ?? null;

  return (
    <div className="flex min-h-dvh">
      <Sidebar user={user} />
      <div className="flex min-w-0 flex-1 flex-col">
        {isDemoMode && (
          <p className="bg-accent px-4 py-1.5 text-center text-xs font-medium text-[#222]">
            Modo demonstração — dados de exemplo. Configure o Supabase no <code>.env.local</code> para usar dados reais.
          </p>
        )}
        <MobileHeader cidade={cidade} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-4 md:px-8 md:pb-12 md:pt-8">{children}</main>
      </div>
      <BottomNav role={user?.tipo ?? null} />
    </div>
  );
}
