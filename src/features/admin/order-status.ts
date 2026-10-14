/** Statuts de commande : module pur, utilisable côté serveur comme côté navigateur. */
export const ORDER_STATUSES = ["nouvelle", "confirmee", "expediee", "livree", "annulee"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  nouvelle: "Nouvelle",
  confirmee: "Confirmée",
  expediee: "Expédiée",
  livree: "Livrée",
  annulee: "Annulée",
};

/** Transitions autorisées : une commande avance, ou est annulée avant expédition. */
export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  nouvelle: ["confirmee", "annulee"],
  confirmee: ["expediee", "annulee"],
  expediee: ["livree"],
  livree: [],
  annulee: [],
};
