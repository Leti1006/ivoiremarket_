import { DELIVERY_ZONES, deliveryFee } from "@/data/delivery-zones";
import { maxQuantityFor, type CartItem } from "@/features/cart/cart-logic";
import type { Product } from "@/types/product";
import type { CheckoutFormData } from "./checkout-schema";

export type OrderLine = {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type DemoOrder = {
  orderNumber: string;
  createdAt: string;
  customer: {
    fullName: string;
    phone: string;
    email?: string;
    zoneLabel: string;
    address: string;
    note?: string;
  };
  lines: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type OrderComputation =
  | { ok: true; lines: OrderLine[]; subtotal: number; deliveryFee: number; total: number }
  | { ok: false; error: string };

/**
 * Recalcule la commande à partir du catalogue : les prix envoyés par le
 * navigateur ne sont jamais utilisés, seuls les identifiants et quantités.
 */
export function computeOrder(
  items: CartItem[],
  zone: CheckoutFormData["zone"],
  findProduct: (id: string) => Product | undefined,
): OrderComputation {
  const lines: OrderLine[] = [];

  for (const item of items) {
    const product = findProduct(item.productId);
    if (!product) return { ok: false, error: "Un article de votre panier n'existe plus." };
    if (item.quantity > maxQuantityFor(product)) {
      return {
        ok: false,
        error: `Stock insuffisant pour « ${product.name} ». Mettez à jour votre panier.`,
      };
    }
    lines.push({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
      lineTotal: product.price * item.quantity,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const fee = deliveryFee(zone, subtotal);
  return { ok: true, lines, subtotal, deliveryFee: fee, total: subtotal + fee };
}

/** Numéro de commande de démonstration, ex. IM-20261012-K4X9QZ. */
export function generateOrderNumber(date: Date, random: string): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `IM-${y}${m}${d}-${random.toUpperCase().slice(0, 6)}`;
}

export function zoneLabel(zoneId: CheckoutFormData["zone"]): string {
  return DELIVERY_ZONES.find((z) => z.id === zoneId)?.label ?? zoneId;
}
