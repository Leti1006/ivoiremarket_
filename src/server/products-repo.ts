import type { CategoryId, Product } from "@/types/product";
import { getDb } from "./db";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  old_price: number | null;
  stock: number;
  description: string;
  highlights: string;
  featured: number;
  image: string | null;
};

function toProduct(row: ProductRow): Product {
  let highlights: string[] = [];
  try {
    const parsed: unknown = JSON.parse(row.highlights);
    if (Array.isArray(parsed)) highlights = parsed.filter((h): h is string => typeof h === "string");
  } catch {
    // Valeur corrompue : on affiche simplement le produit sans points clés.
  }
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    category: row.category as CategoryId,
    price: row.price,
    oldPrice: row.old_price ?? undefined,
    stock: row.stock,
    description: row.description,
    highlights,
    featured: row.featured === 1,
    image: row.image ?? undefined,
  };
}

const COLUMNS = "id, slug, name, brand, category, price, old_price, stock, description, highlights, featured, image";

export function listProducts(): Product[] {
  // Ordre stable : l'ordre d'insertion (identifiants p-001, p-002…).
  const rows = getDb().prepare(`SELECT ${COLUMNS} FROM products ORDER BY created_at, id`).all();
  return (rows as ProductRow[]).map(toProduct);
}

export function findProductById(id: string): Product | undefined {
  const row = getDb().prepare(`SELECT ${COLUMNS} FROM products WHERE id = ?`).get(id);
  return row ? toProduct(row as ProductRow) : undefined;
}

export function findProductBySlug(slug: string): Product | undefined {
  const row = getDb().prepare(`SELECT ${COLUMNS} FROM products WHERE slug = ?`).get(slug);
  return row ? toProduct(row as ProductRow) : undefined;
}

export function slugExists(slug: string, exceptId?: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 FROM products WHERE slug = ? AND id != ?")
    .get(slug, exceptId ?? "");
  return row !== undefined;
}

export type ProductInput = Omit<Product, "id">;

function nextProductId(): string {
  const rows = getDb().prepare("SELECT id FROM products WHERE id LIKE 'p-%'").all() as { id: string }[];
  const max = rows.reduce((m, r) => Math.max(m, Number(r.id.slice(2)) || 0), 0);
  return `p-${String(max + 1).padStart(3, "0")}`;
}

export function createProduct(input: ProductInput): Product {
  const id = nextProductId();
  getDb()
    .prepare(
      `INSERT INTO products (id, slug, name, brand, category, price, old_price, stock, description, highlights, featured, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id, input.slug, input.name, input.brand, input.category, input.price, input.oldPrice ?? null,
      input.stock, input.description, JSON.stringify(input.highlights), input.featured ? 1 : 0, input.image ?? null,
    );
  return findProductById(id)!;
}

export function updateProduct(id: string, input: ProductInput): Product | undefined {
  const result = getDb()
    .prepare(
      `UPDATE products SET slug = ?, name = ?, brand = ?, category = ?, price = ?, old_price = ?, stock = ?,
         description = ?, highlights = ?, featured = ?, image = ?, updated_at = datetime('now')
       WHERE id = ?`,
    )
    .run(
      input.slug, input.name, input.brand, input.category, input.price, input.oldPrice ?? null, input.stock,
      input.description, JSON.stringify(input.highlights), input.featured ? 1 : 0, input.image ?? null, id,
    );
  return result.changes > 0 ? findProductById(id) : undefined;
}

export function deleteProduct(id: string): boolean {
  return getDb().prepare("DELETE FROM products WHERE id = ?").run(id).changes > 0;
}
