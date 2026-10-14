// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import {
  MAX_QUANTITY_PER_ITEM,
  addItem,
  buildCartLines,
  cartItemCount,
  cartSubtotal,
  removeItem,
  setQuantity,
} from "@/features/cart/cart-logic";
import { CART_STORAGE_KEY, getCartSnapshot, parseStoredCart, writeCart } from "@/features/cart/cart-store";
import { seedProducts } from "@/data/seed-products";

const getProductById = (id: string) => seedProducts.find((p) => p.id === id);

const phone = { id: "p-001", stock: 12 }; // 259 000 FCFA
const iphone = { id: "p-004", stock: 4 }; // 649 000 FCFA
const soldOut = { id: "p-005", stock: 0 };

describe("logique du panier", () => {
  it("ajoute un article puis cumule les quantités", () => {
    let items = addItem([], phone, 2);
    items = addItem(items, phone, 3);
    expect(items).toEqual([{ productId: "p-001", quantity: 5 }]);
  });

  it("ne dépasse jamais le stock ni le maximum par article", () => {
    expect(addItem([], iphone, 50)).toEqual([{ productId: "p-004", quantity: 4 }]);
    expect(addItem([], phone, 50)[0].quantity).toBe(MAX_QUANTITY_PER_ITEM);
  });

  it("refuse un produit en rupture de stock", () => {
    expect(addItem([], soldOut, 1)).toEqual([]);
  });

  it("modifie et supprime des articles", () => {
    let items = addItem(addItem([], phone, 1), iphone, 1);
    items = setQuantity(items, phone, 3);
    expect(items.find((i) => i.productId === "p-001")?.quantity).toBe(3);
    items = setQuantity(items, phone, 0);
    expect(items.map((i) => i.productId)).toEqual(["p-004"]);
    expect(removeItem(items, "p-004")).toEqual([]);
  });

  it("calcule les sous-totaux et le total exacts", () => {
    const items = [
      { productId: "p-001", quantity: 2 },
      { productId: "p-004", quantity: 1 },
      { productId: "inconnu", quantity: 1 },
    ];
    const lines = buildCartLines(items, getProductById);
    expect(lines.map((l) => l.lineTotal)).toEqual([518_000, 649_000]);
    expect(cartSubtotal(lines)).toBe(1_167_000);
    expect(cartItemCount(lines)).toBe(3);
  });
});

describe("stockage du panier", () => {
  it("rejette un contenu corrompu ou malveillant", () => {
    expect(parseStoredCart("pas du json")).toEqual([]);
    expect(parseStoredCart(JSON.stringify([{ productId: "p-001", quantity: -3 }]))).toEqual([]);
    expect(parseStoredCart(JSON.stringify({ a: 1 }))).toEqual([]);
  });

  it("conserve le panier dans le localStorage", () => {
    writeCart([{ productId: "p-001", quantity: 2 }]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe('[{"productId":"p-001","quantity":2}]');
    expect(getCartSnapshot()).toEqual([{ productId: "p-001", quantity: 2 }]);
    // Même objet tant que rien ne change (exigé par useSyncExternalStore).
    expect(getCartSnapshot()).toBe(getCartSnapshot());
    writeCart([]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
  });
});
