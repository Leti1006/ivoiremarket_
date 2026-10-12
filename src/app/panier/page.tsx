import type { Metadata } from "next";
import { CartView } from "@/features/cart/components/cart-view";

export const metadata: Metadata = { title: "Mon panier" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Mon panier</h1>
      <CartView />
    </div>
  );
}
