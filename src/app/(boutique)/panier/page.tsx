import type { Metadata } from "next";
import { Suspense } from "react";
import { CartView } from "@/features/cart/components/cart-view";
import { getCatalog } from "@/server/catalog";
import { toSummary } from "@/types/product";

export const metadata: Metadata = { title: "Mon panier" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Mon panier</h1>
      <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-2xl bg-line/60" aria-label="Chargement du panier" />}>
        <CartWithCatalog />
      </Suspense>
    </div>
  );
}

/** Le panier est dans le navigateur ; le serveur fournit les prix et stocks actuels. */
async function CartWithCatalog() {
  const catalog = (await getCatalog()).map(toSummary);
  return <CartView catalog={catalog} />;
}
