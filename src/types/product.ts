export const CATEGORY_IDS = [
  "smartphones",
  "ordinateurs",
  "ecouteurs",
  "accessoires",
  "peripheriques",
  "reseau",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
};

/** Forme d'illustration utilisée pour dessiner le visuel SVG du produit. */
export type ProductShape =
  | "phone"
  | "laptop"
  | "headphones"
  | "earbuds"
  | "charger"
  | "powerbank"
  | "cable"
  | "mouse"
  | "keyboard"
  | "monitor"
  | "printer"
  | "router"
  | "storage";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  /** Prix en francs CFA (entier, sans centimes). */
  price: number;
  /** Ancien prix, présent uniquement pour une promotion de démonstration. */
  oldPrice?: number;
  stock: number;
  description: string;
  highlights: string[];
  featured: boolean;
  visual: {
    shape: ProductShape;
    /** Couleur principale de l'appareil (hexadécimal). */
    color: string;
  };
};
