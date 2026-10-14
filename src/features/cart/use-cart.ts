"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { ProductSummary } from "@/types/product";
import {
  addItem,
  buildCartLines,
  cartItemCount,
  cartSubtotal,
  removeItem,
  setQuantity,
  type CartItem,
} from "./cart-logic";
import { getCartSnapshot, getServerCartSnapshot, subscribeCart, writeCart } from "./cart-store";

type StockInfo = Pick<ProductSummary, "id" | "stock">;

const NO_CATALOG: ProductSummary[] = [];

/**
 * Panier du navigateur.
 * @param catalog produits actuels fournis par le serveur (prix et stock à jour),
 *   nécessaires pour afficher les lignes et calculer les totaux.
 */
export function useCart(catalog: ProductSummary[] = NO_CATALOG) {
  const items: CartItem[] = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerCartSnapshot);

  const lines = useMemo(() => {
    const byId = new Map(catalog.map((p) => [p.id, p]));
    return buildCartLines(items, (id) => byId.get(id));
  }, [items, catalog]);

  const add = useCallback((product: StockInfo, quantity = 1) => {
    writeCart(addItem(getCartSnapshot(), product, quantity));
  }, []);

  const update = useCallback((product: StockInfo, quantity: number) => {
    writeCart(setQuantity(getCartSnapshot(), product, quantity));
  }, []);

  const remove = useCallback((productId: string) => {
    writeCart(removeItem(getCartSnapshot(), productId));
  }, []);

  const clear = useCallback(() => writeCart([]), []);

  return {
    items,
    lines,
    /** Nombre d'articles valides (produits connus et disponibles). */
    count: cartItemCount(lines),
    /** Nombre total d'articles stockés, sans consulter le catalogue (en-tête). */
    storedCount: cartItemCount(items),
    subtotal: cartSubtotal(lines),
    add,
    update,
    remove,
    clear,
  };
}
