import { products } from "@/data/products";
import type { Product } from "@/types/product";

export function getAllProducts(): Product[] {
  return products;
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getFeaturedProducts(limit = 8): Product[] {
  return products.filter((p) => p.featured).slice(0, limit);
}

export function getPromotions(limit = 4): Product[] {
  return products.filter((p) => p.oldPrice !== undefined && p.stock > 0).slice(0, limit);
}

/** Produits de la même catégorie, disponibles en priorité. */
export function getSimilarProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0))
    .slice(0, limit);
}

export function countByCategory(): Record<string, number> {
  return products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
}
