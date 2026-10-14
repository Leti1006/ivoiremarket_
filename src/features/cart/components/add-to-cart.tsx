"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import type { ProductSummary } from "@/types/product";
import { maxQuantityFor } from "../cart-logic";
import { useCart } from "../use-cart";
import { QuantityStepper } from "./quantity-stepper";

export function AddToCart({ product }: { product: ProductSummary }) {
  const { items, add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const max = maxQuantityFor(product);
  const remaining = Math.max(0, max - inCart);

  useEffect(() => {
    if (!justAdded) return;
    const timer = setTimeout(() => setJustAdded(false), 2500);
    return () => clearTimeout(timer);
  }, [justAdded]);

  if (max === 0) {
    return (
      <p className="rounded-xl bg-danger-50 px-4 py-3 text-sm font-medium text-danger">
        Ce produit est actuellement en rupture de stock.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper
          label="Quantité à ajouter"
          value={Math.min(quantity, Math.max(1, remaining))}
          max={Math.max(1, remaining)}
          onChange={setQuantity}
        />
        <button
          type="button"
          disabled={remaining === 0}
          onClick={() => {
            add(product, Math.min(quantity, remaining));
            setQuantity(1);
            setJustAdded(true);
          }}
          className={buttonClasses({ size: "lg", className: "flex-1 sm:flex-none" })}
        >
          {justAdded ? (
            <>
              <Check className="h-5 w-5" aria-hidden="true" /> Ajouté au panier
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" aria-hidden="true" /> Ajouter au panier
            </>
          )}
        </button>
      </div>

      <p role="status" className="min-h-5 text-sm text-muted">
        {remaining === 0 ? (
          <>Vous avez atteint la quantité maximale pour ce produit ({max}).</>
        ) : inCart > 0 ? (
          <>
            {inCart} déjà dans votre panier ·{" "}
            <Link href="/panier" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
              Voir le panier
            </Link>
          </>
        ) : (
          <>Maximum {max} par commande.</>
        )}
      </p>
    </div>
  );
}
