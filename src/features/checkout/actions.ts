"use server";

import { getProductById } from "@/features/products/queries";
import { checkoutFormSchema, orderItemsSchema, type CheckoutField } from "./checkout-schema";
import { computeOrder, generateOrderNumber, zoneLabel, type DemoOrder } from "./order";

export type PlaceOrderResult =
  | { ok: true; order: DemoOrder }
  | { ok: false; formError?: string; fieldErrors?: Partial<Record<CheckoutField, string>> };

/**
 * Server Action : valide la commande de DÉMONSTRATION côté serveur.
 * Aucune donnée n'est enregistrée, aucun paiement n'est effectué.
 * La validation est refaite ici même si le navigateur l'a déjà faite,
 * car une requête peut être envoyée sans passer par l'interface.
 */
export async function placeDemoOrder(form: unknown, items: unknown): Promise<PlaceOrderResult> {
  const parsedForm = checkoutFormSchema.safeParse(form);
  if (!parsedForm.success) {
    const fieldErrors: Partial<Record<CheckoutField, string>> = {};
    for (const issue of parsedForm.error.issues) {
      const field = issue.path[0] as CheckoutField | undefined;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { ok: false, fieldErrors };
  }

  const parsedItems = orderItemsSchema.safeParse(items);
  if (!parsedItems.success) {
    return { ok: false, formError: parsedItems.error.issues[0]?.message ?? "Panier invalide." };
  }

  const computed = computeOrder(parsedItems.data, parsedForm.data.zone, getProductById);
  if (!computed.ok) return { ok: false, formError: computed.error };

  const { zone, ...customer } = parsedForm.data;
  const now = new Date();

  return {
    ok: true,
    order: {
      orderNumber: generateOrderNumber(now, crypto.randomUUID().replace(/-/g, "")),
      createdAt: now.toISOString(),
      customer: { ...customer, zoneLabel: zoneLabel(zone) },
      lines: computed.lines,
      subtotal: computed.subtotal,
      deliveryFee: computed.deliveryFee,
      total: computed.total,
    },
  };
}
