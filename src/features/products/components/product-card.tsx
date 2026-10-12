import Link from "next/link";
import { getCategory } from "@/data/categories";
import type { Product } from "@/types/product";
import { PriceTag } from "./price-tag";
import { ProductVisual } from "./product-visual";
import { StockBadge } from "./stock-badge";

export function ProductCard({ product }: { product: Product }) {
  const href = `/produits/${product.slug}`;
  const isPromo = product.oldPrice !== undefined && product.oldPrice > product.price;

  return (
    <article
      data-testid="product-card"
      className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="relative p-3 pb-0">
        <ProductVisual product={product} className="transition-transform duration-300 group-hover:scale-[1.02]" />
        {isPromo && (
          <span className="absolute left-5 top-5 rounded-lg bg-accent-500 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-ink">
            Promo démo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {product.brand} · {getCategory(product.category).name}
        </p>
        <h3 className="text-[15px] font-semibold leading-snug text-ink">
          {/* Le lien couvre toute la carte grâce au pseudo-élément. */}
          <Link href={href} className="after:absolute after:inset-0 hover:text-brand-700">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto space-y-2 pt-2">
          <PriceTag price={product.price} oldPrice={product.oldPrice} />
          <StockBadge stock={product.stock} />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}
