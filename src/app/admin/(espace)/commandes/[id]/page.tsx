import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { AdminPageHeader, AdminSkeleton, Card, StatusBadge, formatDateTime } from "@/features/admin/components/admin-ui";
import { OrderStatusForm } from "@/features/admin/components/order-status-form";
import { formatPrice } from "@/lib/format";
import { findOrderById } from "@/server/orders-repo";
import { requireAdmin } from "@/server/session";

export const metadata = { title: "Détail de commande" };

export default function AdminOrderPage({ params }: PageProps<"/admin/commandes/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <OrderDetail params={params} />
    </Suspense>
  );
}

async function OrderDetail({ params }: Pick<PageProps<"/admin/commandes/[id]">, "params">) {
  await requireAdmin();
  const id = Number((await params).id);
  const order = Number.isInteger(id) && id > 0 ? findOrderById(id) : undefined;
  if (!order) notFound();

  return (
    <>
      <Link href="/admin/commandes" className="mb-3 inline-flex items-center gap-1 text-sm text-muted hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Toutes les commandes
      </Link>
      <AdminPageHeader
        title={`Commande ${order.orderNumber}`}
        description={`Passée le ${formatDateTime(order.createdAt)} · mise à jour le ${formatDateTime(order.updatedAt)}`}
        actions={<StatusBadge status={order.status} />}
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <h2 className="mb-4 text-lg font-bold text-ink">Articles</h2>
            <ul className="divide-y divide-line text-sm">
              {order.lines.map((l) => (
                <li key={l.productId} className="flex justify-between gap-4 py-3">
                  <span>
                    <span className="font-medium text-ink">{l.name}</span>
                    <span className="block text-xs text-muted">{formatPrice(l.unitPrice)} × {l.quantity}</span>
                  </span>
                  <span className="font-semibold">{formatPrice(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Sous-total</dt><dd>{formatPrice(order.subtotal)}</dd></div>
              <div className="flex justify-between">
                <dt className="text-muted">Livraison</dt>
                <dd>{order.deliveryFee === 0 ? "Offerte" : formatPrice(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
            </dl>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-bold text-ink">Traitement</h2>
            <OrderStatusForm id={order.id} status={order.status} />
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 text-lg font-bold text-ink">Client et livraison</h2>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-muted">Nom</dt><dd className="font-medium text-ink">{order.customer.fullName}</dd></div>
            <div>
              <dt className="text-muted">Téléphone</dt>
              <dd><a href={`tel:${order.customer.phone.replace(/\s/g, "")}`} className="font-medium text-brand-700 hover:underline">{order.customer.phone}</a></dd>
            </div>
            {order.customer.email && <div><dt className="text-muted">E-mail</dt><dd className="font-medium text-ink">{order.customer.email}</dd></div>}
            <div><dt className="text-muted">Zone</dt><dd className="font-medium text-ink">{order.customer.zoneLabel}</dd></div>
            <div><dt className="text-muted">Adresse</dt><dd className="font-medium text-ink">{order.customer.address}</dd></div>
            {order.customer.note && <div><dt className="text-muted">Instructions</dt><dd className="text-ink">{order.customer.note}</dd></div>}
            <div><dt className="text-muted">Paiement</dt><dd className="text-ink">À la livraison</dd></div>
          </dl>
        </Card>
      </div>
    </>
  );
}
