import type { Metadata } from "next";
import { CheckoutForm } from "@/features/checkout/components/checkout-form";

export const metadata: Metadata = { title: "Commande" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Finaliser la commande</h1>
      <p className="mt-1 text-muted">Commande de démonstration : aucun paiement ni aucune livraison réels.</p>
      <CheckoutForm />
    </div>
  );
}
