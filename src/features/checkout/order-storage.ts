import type { DemoOrder } from "./order";

/**
 * La dernière commande de démonstration est gardée dans le sessionStorage
 * (effacé à la fermeture de l'onglet) pour afficher la page de confirmation.
 */
export const LAST_ORDER_KEY = "ivoiremarket:last-order";

export function saveLastOrder(order: DemoOrder): void {
  try {
    window.sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch {
    // Stockage indisponible : la confirmation affichera un message générique.
  }
}

export function readLastOrder(): DemoOrder | null {
  try {
    const raw = window.sessionStorage.getItem(LAST_ORDER_KEY);
    if (!raw) return null;
    const order = JSON.parse(raw) as DemoOrder;
    return typeof order?.orderNumber === "string" && Array.isArray(order.lines) ? order : null;
  } catch {
    return null;
  }
}
