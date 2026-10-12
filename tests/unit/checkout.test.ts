import { describe, expect, it } from "vitest";
import { deliveryFee, FREE_DELIVERY_THRESHOLD } from "@/data/delivery-zones";
import { placeDemoOrder } from "@/features/checkout/actions";
import { checkoutFormSchema, normalizeIvorianPhone } from "@/features/checkout/checkout-schema";
import { computeOrder, generateOrderNumber } from "@/features/checkout/order";
import { getProductById } from "@/features/products/queries";

const validForm = {
  fullName: "Aya Konan",
  phone: "07 08 09 10 11",
  email: "",
  zone: "abidjan-cocody",
  address: "Riviera 2, près de la pharmacie",
  note: "",
};

describe("normalizeIvorianPhone", () => {
  it("accepte les formats courants", () => {
    expect(normalizeIvorianPhone("0708091011")).toBe("+225 07 08 09 10 11");
    expect(normalizeIvorianPhone("+225 05.12.34.56.78")).toBe("+225 05 12 34 56 78");
    expect(normalizeIvorianPhone("00225 27-22-00-00-00")).toBe("+225 27 22 00 00 00");
  });

  it("rejette les numéros invalides", () => {
    for (const n of ["", "12345", "0908091011", "07080910111", "07 08 09 10 1a"]) {
      expect(normalizeIvorianPhone(n)).toBeNull();
    }
  });
});

describe("checkoutFormSchema", () => {
  it("valide un formulaire correct et normalise les données", () => {
    const r = checkoutFormSchema.safeParse({ ...validForm, fullName: "  Aya Konan  " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.fullName).toBe("Aya Konan");
      expect(r.data.phone).toBe("+225 07 08 09 10 11");
      expect(r.data.email).toBeUndefined();
    }
  });

  it("signale chaque champ invalide", () => {
    const r = checkoutFormSchema.safeParse({
      fullName: "<script>",
      phone: "123",
      email: "pas-un-email",
      zone: "mars",
      address: "ici",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = new Set(r.error.issues.map((i) => i.path[0]));
      expect(fields).toEqual(new Set(["fullName", "phone", "email", "zone", "address"]));
    }
  });
});

describe("calcul de la commande", () => {
  it("recalcule les prix depuis le catalogue et ajoute la livraison", () => {
    const r = computeOrder([{ productId: "p-011", quantity: 2 }], "abidjan-cocody", getProductById);
    expect(r).toMatchObject({ ok: true, subtotal: 69_000, deliveryFee: 2_000, total: 71_000 });
  });

  it("offre la livraison au-delà du seuil", () => {
    expect(deliveryFee("interieur", FREE_DELIVERY_THRESHOLD - 1)).toBe(5_000);
    expect(deliveryFee("interieur", FREE_DELIVERY_THRESHOLD)).toBe(0);
  });

  it("refuse un produit inconnu ou un stock insuffisant", () => {
    expect(computeOrder([{ productId: "x", quantity: 1 }], "interieur", getProductById).ok).toBe(false);
    expect(computeOrder([{ productId: "p-004", quantity: 9 }], "interieur", getProductById).ok).toBe(false);
    expect(computeOrder([{ productId: "p-005", quantity: 1 }], "interieur", getProductById).ok).toBe(false);
  });

  it("génère un numéro de commande lisible", () => {
    expect(generateOrderNumber(new Date("2026-10-12T10:00:00Z"), "a1b2c3d4")).toBe("IM-20261012-A1B2C3");
  });
});

describe("placeDemoOrder (Server Action)", () => {
  it("ignore tout prix envoyé par le client", async () => {
    const r = await placeDemoOrder(validForm, [{ productId: "p-011", quantity: 1, price: 1 }]);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.order.total).toBe(34_500 + 2_000);
      expect(r.order.orderNumber).toMatch(/^IM-\d{8}-[0-9A-F]{6}$/);
      expect(r.order.customer.zoneLabel).toBe("Abidjan – Cocody");
    }
  });

  it("renvoie les erreurs de champ et refuse un panier vide", async () => {
    const bad = await placeDemoOrder({ ...validForm, phone: "1" }, [{ productId: "p-011", quantity: 1 }]);
    expect(bad).toMatchObject({ ok: false, fieldErrors: { phone: expect.any(String) } });

    const empty = await placeDemoOrder(validForm, []);
    expect(empty).toMatchObject({ ok: false, formError: "Votre panier est vide." });
  });

  it("refuse des données qui ne sont pas un objet", async () => {
    const r = await placeDemoOrder("n'importe quoi", "pas un tableau");
    expect(r.ok).toBe(false);
  });
});
