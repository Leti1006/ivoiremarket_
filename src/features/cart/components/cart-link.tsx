"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../use-cart";

export function CartLink() {
  const { count } = useCart();
  const label = count > 0 ? `Panier, ${count} article${count > 1 ? "s" : ""}` : "Panier vide";

  return (
    <Link
      href="/panier"
      aria-label={label}
      className="relative inline-flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink hover:bg-brand-50 hover:text-brand-700"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">Panier</span>
      {count > 0 && (
        <span
          data-testid="cart-count"
          className="absolute -right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-ink sm:static sm:ml-0.5"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
