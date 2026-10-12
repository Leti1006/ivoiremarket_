/** Zones et frais de livraison de démonstration. */
export const DELIVERY_ZONES = [
  { id: "abidjan-cocody", label: "Abidjan – Cocody", fee: 2_000 },
  { id: "abidjan-plateau", label: "Abidjan – Plateau", fee: 2_000 },
  { id: "abidjan-marcory", label: "Abidjan – Marcory", fee: 2_000 },
  { id: "abidjan-treichville", label: "Abidjan – Treichville", fee: 2_000 },
  { id: "abidjan-yopougon", label: "Abidjan – Yopougon", fee: 2_500 },
  { id: "abidjan-abobo", label: "Abidjan – Abobo", fee: 2_500 },
  { id: "abidjan-adjame", label: "Abidjan – Adjamé", fee: 2_000 },
  { id: "abidjan-koumassi", label: "Abidjan – Koumassi", fee: 2_000 },
  { id: "abidjan-port-bouet", label: "Abidjan – Port-Bouët", fee: 2_500 },
  { id: "bingerville", label: "Bingerville", fee: 3_000 },
  { id: "interieur", label: "Intérieur du pays (Bouaké, Yamoussoukro, San-Pédro…)", fee: 5_000 },
] as const;

export type DeliveryZoneId = (typeof DELIVERY_ZONES)[number]["id"];

/** Livraison offerte à partir de ce sous-total (démonstration). */
export const FREE_DELIVERY_THRESHOLD = 200_000;

export function deliveryFee(zoneId: DeliveryZoneId, subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0;
  const zone = DELIVERY_ZONES.find((z) => z.id === zoneId);
  return zone ? zone.fee : 0;
}
