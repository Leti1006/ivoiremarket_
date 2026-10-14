import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, Banknote, Boxes, PackageX, ShoppingBag } from "lucide-react";
import { AdminPageHeader, AdminSkeleton, Card, StatusBadge, formatDateTime } from "@/features/admin/components/admin-ui";
import { formatPrice } from "@/lib/format";
import { getDashboardStats, listOrders } from "@/server/orders-repo";
import { listProducts } from "@/server/products-repo";
import { requireAdmin } from "@/server/session";

export const metadata = { title: "Tableau de bord" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  await requireAdmin();
  const stats = getDashboardStats();
  const toProcess = listOrders().filter((o) => o.status === "nouvelle" || o.status === "confirmee").slice(0, 6);
  const lowStock = listProducts()
    .filter((p) => p.stock <= 5)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  const cards = [
    { label: "Produits au catalogue", value: String(stats.productCount), icon: Boxes, href: "/admin/produits" },
    { label: "Commandes à traiter", value: String(stats.ordersByStatus.nouvelle + stats.ordersByStatus.confirmee), icon: ShoppingBag, href: "/admin/commandes" },
    { label: "Ruptures de stock", value: String(stats.outOfStock), icon: PackageX, href: "/admin/produits?stock=rupture" },
    { label: "Chiffre d'affaires (démo)", value: formatPrice(stats.revenue), icon: Banknote, href: "/admin/commandes" },
  ];

  return (
    <>
      <AdminPageHeader title="Tableau de bord" description="Vue d'ensemble du catalogue, des stocks et des commandes." />

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <li key={label}>
            <Link href={href} className="block rounded-2xl border border-line bg-card p-5 shadow-card transition hover:border-brand-600">
              <Icon className="h-5 w-5 text-brand-700" aria-hidden="true" />
              <p className="mt-3 text-2xl font-extrabold text-ink" data-testid={`stat-${label}`}>{value}</p>
              <p className="text-sm text-muted">{label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-ink">Commandes à traiter</h2>
            <Link href="/admin/commandes" className="text-sm font-semibold text-brand-700 hover:underline">Toutes les commandes</Link>
          </div>
          {toProcess.length === 0 ? (
            <p className="text-sm text-muted">Aucune commande en attente.</p>
          ) : (
            <ul className="divide-y divide-line">
              {toProcess.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/commandes/${o.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 hover:text-brand-700">
                    <span>
                      <span className="block font-semibold text-ink">{o.orderNumber}</span>
                      <span className="text-xs text-muted">{o.customer.fullName} · {formatDateTime(o.createdAt)}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-sm font-semibold">{formatPrice(o.total)}</span>
                      <StatusBadge status={o.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <AlertTriangle className="h-5 w-5 text-accent-600" aria-hidden="true" />
              Stock faible ou épuisé
            </h2>
            <span className="text-sm text-muted">{stats.lowStock} faible · {stats.outOfStock} épuisé</span>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted">Tous les produits ont un stock suffisant.</p>
          ) : (
            <ul className="divide-y divide-line">
              {lowStock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/produits/${p.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-brand-700">
                    <span className="min-w-0 truncate text-sm font-medium text-ink">{p.name}</span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${p.stock === 0 ? "bg-danger-50 text-danger" : "bg-accent-50 text-accent-700"}`}
                    >
                      {p.stock === 0 ? "Épuisé" : `${p.stock} restant${p.stock > 1 ? "s" : ""}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
