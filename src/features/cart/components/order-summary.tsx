import type { ReactNode } from "react";
import { FREE_DELIVERY_THRESHOLD } from "@/data/delivery-zones";
import { formatPrice } from "@/lib/format";

/** Bloc récapitulatif réutilisé par le panier, la commande et la confirmation. */
export function OrderSummary({
  subtotal,
  deliveryFee,
  itemCount,
  children,
  title = "Récapitulatif",
}: {
  subtotal: number;
  /** undefined = frais calculés à l'étape suivante. */
  deliveryFee?: number;
  itemCount: number;
  children?: ReactNode;
  title?: string;
}) {
  const total = subtotal + (deliveryFee ?? 0);
  const missingForFree = FREE_DELIVERY_THRESHOLD - subtotal;

  return (
    <div className="rounded-2xl border border-line bg-card p-5 shadow-card">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">
            Sous-total ({itemCount} article{itemCount > 1 ? "s" : ""})
          </dt>
          <dd className="font-semibold text-ink" data-testid="subtotal">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Livraison</dt>
          <dd className="font-semibold text-ink" data-testid="delivery-fee">
            {deliveryFee === undefined
              ? "Calculée à l'étape suivante"
              : deliveryFee === 0
                ? "Offerte"
                : formatPrice(deliveryFee)}
          </dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
          <dt className="font-bold text-ink">Total</dt>
          <dd className="font-extrabold text-ink" data-testid="total">{formatPrice(total)}</dd>
        </div>
      </dl>
      {missingForFree > 0 && deliveryFee !== 0 && (
        <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-800">
          Plus que {formatPrice(missingForFree)} pour profiter de la livraison offerte.
        </p>
      )}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
