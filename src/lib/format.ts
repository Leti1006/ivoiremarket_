const NBSP = " ";

/**
 * Formate un montant entier en francs CFA : 125000 -> "125 000 FCFA".
 * Implémentation manuelle (et non Intl) pour obtenir exactement le même
 * rendu sur le serveur, dans le navigateur et dans l'image Docker.
 */
export function formatPrice(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? "-" : "";
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${sign}${digits}${NBSP}FCFA`;
}

/** Pourcentage de réduction arrondi, ex. 285000 -> 259000 = 9. */
export function discountPercent(price: number, oldPrice: number): number {
  if (oldPrice <= 0 || price >= oldPrice) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
