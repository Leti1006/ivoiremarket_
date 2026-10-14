"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ReceiptText, Store } from "lucide-react";
import { cn } from "@/lib/cn";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true },
  { href: "/admin/produits", label: "Produits", icon: Package, exact: false },
  { href: "/admin/commandes", label: "Commandes", icon: ReceiptText, exact: false },
] as const;

export function AdminNav({ active }: { active?: string }) {
  const pathname = usePathname();
  const current = active ?? pathname;
  return <AdminNavLinks current={current} />;
}

export function AdminNavLinks({ current }: { current?: string }) {
  return (
    <nav aria-label="Administration" className="flex gap-1 overflow-x-auto lg:flex-col">
      {ADMIN_LINKS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = current !== undefined && (exact ? current === href : current.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-white/15 text-white" : "text-brand-100 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-100 hover:bg-white/10 hover:text-white lg:mt-4"
      >
        <Store className="h-4 w-4" aria-hidden="true" />
        Voir la boutique
      </Link>
    </nav>
  );
}
