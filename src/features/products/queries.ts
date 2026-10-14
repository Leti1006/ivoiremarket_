import type { Product } from "@/types/product";

/** Fonctions pures de sélection : elles reçoivent la liste issue de la base. */

export function getFeaturedProducts(list: Product[], limit = 8): Product[] {
  return list.filter((p) => p.featured && p.stock > 0).slice(0, limit);
}

export function getPromotions(list: Product[], limit = 4): Product[] {
  return list.filter((p) => p.oldPrice !== undefined && p.oldPrice > p.price && p.stock > 0).slice(0, limit);
}

/** Produits de la même catégorie, disponibles en priorité. */
export function getSimilarProducts(list: Product[], product: Product, limit = 4): Product[] {
  return list
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0))
    .slice(0, limit);
}

export function countByCategory(list: Product[]): Record<string, number> {
  return list.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
}
