import Link from "next/link";
import { Suspense } from "react";
import { AdminPageHeader, AdminSkeleton, StatusBadge, formatDateTime } from "@/features/admin/components/admin-ui";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/features/admin/order-status";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";
import { getDashboardStats, listOrders } from "@/server/orders-repo";
import { requireAdmin } from "@/server/session";

export const metadata = { title: "Commandes" };

export default function AdminOrdersPage({ searchParams }: PageProps<"/admin/commandes">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <OrdersTable searchParams={searchParams} />
    </Suspense>
  );
}

async function OrdersTable({ searchParams }: Pick<PageProps<"/admin/commandes">, "searchParams">) {
  await requireAdmin();
  const raw = (await searchParams).statut;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const status = (ORDER_STATUSES as readonly string[]).includes(value ?? "") ? (value as OrderStatus) : undefined;

  const orders = listOrders({ status });
  const counts = getDashboardStats().ordersByStatus;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const tab = (active: boolean) =>
    cn(
      "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium",
      active ? "border-brand-700 bg-brand-700 text-white" : "border-line bg-card text-ink hover:border-brand-600",
    );

  return (
    <>
      <AdminPageHeader title="Commandes" description="Suivi des commandes passées sur la boutique, de la réception à la livraison." />

      <nav aria-label="Filtrer par statut" className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-2">
          <li>
            <Link href="/admin/commandes" className={tab(!status)} aria-current={!status ? "page" : undefined}>
              Toutes <span className="opacity-70">{total}</span>
            </Link>
          </li>
          {ORDER_STATUSES.map((s) => (
            <li key={s}>
              <Link href={`/admin/commandes?statut=${s}`} className={tab(status === s)} aria-current={status === s ? "page" : undefined}>
                {STATUS_LABELS[s]} <span className="opacity-70">{counts[s]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="overflow-x-auto rounded-2xl border border-line bg-card shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs uppercase tracking-wider text-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Commande</th>
              <th scope="col" className="px-4 py-3">Client</th>
              <th scope="col" className="px-4 py-3">Zone</th>
              <th scope="col" className="px-4 py-3 text-right">Total</th>
              <th scope="col" className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {orders.map((o) => (
              <tr key={o.id} data-testid="admin-order-row" className="hover:bg-surface/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/commandes/${o.id}`} className="font-semibold text-brand-700 hover:underline">
                    {o.orderNumber}
                  </Link>
                  <p className="text-xs text-muted">{formatDateTime(o.createdAt)}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{o.customer.fullName}</p>
                  <p className="text-xs text-muted">{o.customer.phone}</p>
                </td>
                <td className="max-w-[14rem] truncate px-4 py-3 text-muted">{o.customer.zoneLabel}</td>
                <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">{formatPrice(o.total)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted">
            Aucune commande{status ? ` au statut « ${STATUS_LABELS[status]} »` : ""} pour le moment.
          </p>
        )}
      </div>
    </>
  );
}
