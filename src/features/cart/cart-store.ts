import { z } from "zod";
import type { CartItem } from "./cart-logic";

/**
 * Stockage du panier dans le localStorage du navigateur.
 * Le panier survit à une actualisation de la page ; il n'est jamais envoyé
 * au serveur, sauf au moment de valider la commande.
 */
export const CART_STORAGE_KEY = "ivoiremarket:cart:v1";

const storedCartSchema = z
  .array(
    z.object({
      productId: z.string().max(40),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .max(100);

const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();

// Cache : useSyncExternalStore exige le même objet tant que la donnée ne change pas.
let cachedRaw: string | null | undefined;
let cachedItems: CartItem[] = EMPTY;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(CART_STORAGE_KEY);
  } catch {
    return null; // stockage bloqué (navigation privée, etc.)
  }
}

export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return EMPTY;
  try {
    const result = storedCartSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function getCartSnapshot(): CartItem[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parseStoredCart(raw);
  }
  return cachedItems;
}

/** Rendu serveur : le panier est toujours vide, le navigateur prend le relais. */
export function getServerCartSnapshot(): CartItem[] {
  return EMPTY;
}

export function writeCart(items: CartItem[]): void {
  try {
    if (items.length === 0) window.localStorage.removeItem(CART_STORAGE_KEY);
    else window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Stockage indisponible : on met tout de même à jour l'état en mémoire.
    cachedRaw = JSON.stringify(items);
    cachedItems = items;
  }
  listeners.forEach((listener) => listener());
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  // Synchronise les onglets ouverts en même temps.
  const onStorage = (event: StorageEvent) => {
    if (event.key === CART_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
