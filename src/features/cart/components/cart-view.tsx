"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { ProductVisual } from "@/features/products/components/product-visual";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { maxQuantityFor } from "../cart-logic";
import { useCart } from "../use-cart";
import { OrderSummary } from "./order-summary";
import { QuantityStepper } from "./quantity-stepper";

export function CartView() {
  const hydrated = useHydrated();
  const { lines, count, subtotal, update, remove } = useCart();

  if (!hydrated) {
    return (
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]" aria-busy="true" aria-label="Chargement du panier">
        <div className="h-48 animate-pulse rounded-2xl bg-line/60" />
        <div className="h-48 animate-pulse rounded-2xl bg-line/60" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-line bg-card px-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <ShoppingBag className="h-8 w-8" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-xl font-bold text-ink">Votre panier est vide</h2>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Parcourez le catalogue et ajoutez les produits qui vous intéressent : ils seront conservés
          sur cet appareil.
        </p>
        <Link href="/catalogue" className={buttonClasses({ className: "mt-6" })}>
          Découvrir le catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
      <ul className="divide-y divide-line rounded-2xl border border-line bg-card shadow-card" aria-label="Articles du panier">
        {lines.map(({ product, quantity, lineTotal }) => (
          <li key={product.id} data-testid="cart-line" className="flex gap-4 p-4 sm:p-5">
            <Link href={`/produits/${product.slug}`} className="w-20 shrink-0 sm:w-28" tabIndex={-1} aria-hidden="true">
              <ProductVisual product={product} size="sm" />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Link href={`/produits/${product.slug}`} className="font-semibold leading-snug text-ink hover:text-brand-700">
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-muted">{formatPrice(product.price)} l&apos;unité</p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                <QuantityStepper
                  size="sm"
                  label={`Quantité pour ${product.name}`}
                  value={quantity}
                  max={maxQuantityFor(product)}
                  onChange={(q) => update(product, q)}
                />
                <p className="font-bold text-ink" data-testid="line-total">{formatPrice(lineTotal)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => remove(product.id)}
              aria-label={`Retirer ${product.name} du panier`}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-danger-50 hover:text-danger"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <div className="space-y-3 lg:sticky lg:top-36">
        <OrderSummary subtotal={subtotal} itemCount={count}>
          <Link href="/commande" className={buttonClasses({ size: "lg", className: "w-full" })}>
            Passer la commande <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </OrderSummary>
        <Link href="/catalogue" className={buttonClasses({ variant: "ghost", className: "w-full" })}>
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
