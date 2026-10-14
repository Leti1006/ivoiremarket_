import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { getCatalog } from "@/server/catalog";
import { toSummary } from "@/types/product";

export const metadata: Metadata = { title: "Commande" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Finaliser la commande</h1>
      <p className="mt-1 text-muted">Paiement à la livraison. Aucune carte bancaire n&apos;est demandée.</p>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-2xl bg-line/60" aria-label="Chargement" />}>
        <CheckoutWithCatalog />
      </Suspense>
    </div>
  );
}

async function CheckoutWithCatalog() {
  const catalog = (await getCatalog()).map(toSummary);
  return <CheckoutForm catalog={catalog} />;
}
