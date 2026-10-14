"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { CheckCircle2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { OrderSummary } from "@/features/cart/components/order-summary";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { readLastOrder } from "../order-storage";
import type { DemoOrder } from "../order";

const subscribe = () => () => {};
let cached: { raw: string | null; order: DemoOrder | null } = { raw: null, order: null };

function getOrderSnapshot(): DemoOrder | null {
  const order = readLastOrder();
  const raw = order ? order.orderNumber : null;
  if (raw !== cached.raw) cached = { raw, order };
  return cached.order;
}

export function ConfirmationView() {
  const hydrated = useHydrated();
  const order = useSyncExternalStore(subscribe, getOrderSnapshot, () => null);

  if (!hydrated) {
    return <div className="mt-8 h-72 animate-pulse rounded-2xl bg-line/60" aria-busy="true" aria-label="Chargement" />;
  }

  if (!order) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-line bg-card px-6 py-14 text-center">
        <h1 className="text-2xl font-bold text-ink">Aucune commande récente</h1>
        <p className="mt-1 text-sm text-muted">
          La confirmation n&apos;est disponible que dans l&apos;onglet où la commande a été passée.
        </p>
        <Link href="/catalogue" className={buttonClasses({ className: "mt-6" })}>Retour au catalogue</Link>
      </div>
    );
  }

  const itemCount = order.lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <div className="mx-auto mt-8 max-w-3xl">
      <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6 text-center sm:p-10">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-600" aria-hidden="true" />
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink">Merci, commande validée !</h1>
        <p className="mt-2 text-muted">
          {order.customer.fullName}, votre commande a bien été enregistrée et sera traitée par notre équipe.
        </p>
        <p className="mt-5 inline-flex flex-col rounded-2xl bg-card px-6 py-3 shadow-card">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Numéro de commande</span>
          <span className="text-xl font-extrabold tracking-wide text-brand-700" data-testid="order-number">
            {order.orderNumber}
          </span>
        </p>
        <p className="mt-4 text-xs text-muted">
          Projet de démonstration : aucune livraison réelle et aucun paiement ne seront effectués.
        </p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
          <h2 className="text-lg font-bold text-ink">Livraison</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div><dt className="text-muted">Téléphone</dt><dd className="font-medium text-ink">{order.customer.phone}</dd></div>
            <div><dt className="text-muted">Zone</dt><dd className="font-medium text-ink">{order.customer.zoneLabel}</dd></div>
            <div><dt className="text-muted">Adresse</dt><dd className="font-medium text-ink">{order.customer.address}</dd></div>
          </dl>
          <h2 className="mt-5 text-lg font-bold text-ink">Articles</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-3">
                <span className="text-ink">{l.name} <span className="text-muted">× {l.quantity}</span></span>
                <span className="shrink-0 font-medium">{formatPrice(l.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </div>
        <OrderSummary subtotal={order.subtotal} deliveryFee={order.deliveryFee} itemCount={itemCount} title="Montant total">
          <Link href="/catalogue" className={buttonClasses({ size: "lg", className: "w-full" })}>
            Retour au catalogue
          </Link>
        </OrderSummary>
      </div>
    </div>
  );
}
