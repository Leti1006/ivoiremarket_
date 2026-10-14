import type { Product, ProductSummary } from "@/types/product";

export type CartItem = {
  productId: string;
  quantity: number;
};

export type CartLine = {
  product: ProductSummary;
  quantity: number;
  /** Prix unitaire × quantité, en FCFA. */
  lineTotal: number;
};

/** Quantité maximale par article, quel que soit le stock. */
export const MAX_QUANTITY_PER_ITEM = 10;

export function maxQuantityFor(product: Pick<Product, "stock">): number {
  return Math.max(0, Math.min(product.stock, MAX_QUANTITY_PER_ITEM));
}

function clamp(quantity: number, max: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(Math.max(1, Math.floor(quantity)), max);
}

/** Ajoute un article ou augmente sa quantité, sans dépasser le maximum autorisé. */
export function addItem(
  items: CartItem[],
  product: Pick<Product, "id" | "stock">,
  quantity = 1,
): CartItem[] {
  const max = maxQuantityFor(product);
  if (max === 0) return items;

  const existing = items.find((i) => i.productId === product.id);
  if (existing) {
    return items.map((i) =>
      i.productId === product.id ? { ...i, quantity: clamp(i.quantity + quantity, max) } : i,
    );
  }
  return [...items, { productId: product.id, quantity: clamp(quantity, max) }];
}

export function setQuantity(
  items: CartItem[],
  product: Pick<Product, "id" | "stock">,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) return removeItem(items, product.id);
  const max = maxQuantityFor(product);
  return items.map((i) =>
    i.productId === product.id ? { ...i, quantity: clamp(quantity, max) } : i,
  );
}

export function removeItem(items: CartItem[], productId: string): CartItem[] {
  return items.filter((i) => i.productId !== productId);
}

/**
 * Associe chaque article à son produit du catalogue.
 * Les articles inconnus ou épuisés sont ignorés, et les quantités sont
 * ramenées au stock disponible.
 */
export function buildCartLines(
  items: CartItem[],
  findProduct: (id: string) => ProductSummary | undefined,
): CartLine[] {
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = findProduct(item.productId);
    if (!product) continue;
    const max = maxQuantityFor(product);
    if (max === 0) continue;
    const quantity = clamp(item.quantity, max);
    lines.push({ product, quantity, lineTotal: product.price * quantity });
  }
  return lines;
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}

export function cartItemCount(items: { quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
