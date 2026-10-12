"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getProductById } from "@/features/products/queries";
import type { Product } from "@/types/product";
import {
  addItem,
  buildCartLines,
  cartItemCount,
  cartSubtotal,
  removeItem,
  setQuantity,
} from "./cart-logic";
import { getCartSnapshot, getServerCartSnapshot, subscribeCart, writeCart } from "./cart-store";

export function useCart() {
  const items = useSyncExternalStore(subscribeCart, getCartSnapshot, getServerCartSnapshot);

  const lines = useMemo(() => buildCartLines(items, getProductById), [items]);

  const add = useCallback((product: Product, quantity = 1) => {
    writeCart(addItem(getCartSnapshot(), product, quantity));
  }, []);

  const update = useCallback((product: Product, quantity: number) => {
    writeCart(setQuantity(getCartSnapshot(), product, quantity));
  }, []);

  const remove = useCallback((productId: string) => {
    writeCart(removeItem(getCartSnapshot(), productId));
  }, []);

  const clear = useCallback(() => writeCart([]), []);

  return {
    items,
    lines,
    count: cartItemCount(lines),
    subtotal: cartSubtotal(lines),
    add,
    update,
    remove,
    clear,
  };
}
