import type { Metadata } from "next";
import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { logoutAction } from "@/features/admin/actions";
import { AdminNav, AdminNavLinks } from "@/features/admin/components/admin-nav";

export const metadata: Metadata = {
  title: { default: "Administration", template: "%s | Admin IvoireMarket" },
  robots: { index: false, follow: false },
};

/**
 * Habillage de l'espace administrateur.
 * Chaque page vérifie elle-même la session (requireAdmin) avant de lire
 * la moindre donnée ; le Proxy redirige déjà les visiteurs non connectés.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <aside className="bg-brand-900 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-5 lg:py-6">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <div className="leading-tight">
              <p className="font-extrabold">IvoireMarket</p>
              <p className="text-xs text-brand-100/80">Administration</p>
            </div>
          </div>
          <LogoutButton className="lg:hidden" />
        </div>
        <div className="px-3 pb-3 lg:px-4">
          <Suspense fallback={<AdminNavLinks />}>
            <AdminNav />
          </Suspense>
        </div>
        <LogoutButton className="mt-auto hidden px-4 pb-6 lg:block" />
      </aside>
      <main id="contenu" className="min-w-0 flex-1 bg-surface px-4 py-6 sm:px-8 sm:py-8">
        {children}
      </main>
    </div>
  );
}

function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logoutAction} className={className}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-brand-100 hover:bg-white/10 hover:text-white"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Déconnexion
      </button>
    </form>
  );
}
