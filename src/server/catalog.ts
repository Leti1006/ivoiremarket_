import { connection } from "next/server";
import type { Product } from "@/types/product";
import { findProductBySlug, listProducts } from "./products-repo";

/**
 * Lectures du catalogue pour les pages.
 * La base SQLite répond de façon synchrone : sans connection(), Next.js
 * figerait les données au moment du build. Ici, chaque visite lit l'état
 * actuel, donc une modification faite dans l'administration est visible
 * immédiatement.
 */
export async function getCatalog(): Promise<Product[]> {
  await connection();
  return listProducts();
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  await connection();
  return findProductBySlug(slug);
}
