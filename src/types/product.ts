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

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  /** Prix en francs CFA (entier, sans centimes). */
  price: number;
  /** Ancien prix, présent uniquement pour une promotion. */
  oldPrice?: number;
  stock: number;
  description: string;
  highlights: string[];
  featured: boolean;
  /** Clé de la photo dans la photothèque (src/data/image-credits.json), ou absente. */
  image?: string;
};

/** Données minimales d'un produit transmises au navigateur (panier, commande). */
export type ProductSummary = Pick<
  Product,
  "id" | "slug" | "name" | "brand" | "category" | "price" | "oldPrice" | "stock" | "image"
>;

export function toSummary(p: Product): ProductSummary {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    oldPrice: p.oldPrice,
    stock: p.stock,
    image: p.image,
  };
}
