import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Check, ChevronRight } from "lucide-react";
import { getCategory } from "@/data/categories";
import { AddToCart } from "@/features/cart/components/add-to-cart";
import { PriceTag } from "@/features/products/components/price-tag";
import { ProductGrid } from "@/features/products/components/product-card";
import { PhotoCredit, ProductPhoto } from "@/features/products/components/product-photo";
import { StockBadge } from "@/features/products/components/stock-badge";
import { getSimilarProducts } from "@/features/products/queries";
import { getCatalog, getProduct } from "@/server/catalog";
import { toSummary } from "@/types/product";

export async function generateMetadata({ params }: PageProps<"/produits/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Produit introuvable" };
  return { title: product.name, description: product.description };
}

export default function ProductPage({ params }: PageProps<"/produits/[slug]">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      {/* Les données viennent de la base à chaque visite (prix et stock à jour). */}
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetails({ params }: Pick<PageProps<"/produits/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  // Normalement déjà filtré par le Proxy (vrai statut 404) ; sécurité supplémentaire.
  if (!product) notFound();

  const category = getCategory(product.category);
  const similar = getSimilarProducts(await getCatalog(), product, 4);

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:text-brand-700">Accueil</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li><Link href="/catalogue" className="hover:text-brand-700">Catalogue</Link></li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li>
            <Link href={`/catalogue?categorie=${category.id}`} className="hover:text-brand-700">{category.name}</Link>
          </li>
          <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
          <li aria-current="page" className="max-w-[16rem] truncate font-medium text-ink">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-2 lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-3xl border border-line bg-card p-3 shadow-card">
            <ProductPhoto product={product} sizes="(min-width: 1024px) 600px, 92vw" preload variant="full" />
          </div>
          <PhotoCredit imageKey={product.image} />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
            {product.brand} · {category.name}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            {product.name}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <StockBadge stock={product.stock} />
            {product.oldPrice !== undefined && <span className="text-xs text-muted">Promotion en cours</span>}
          </div>

          <div className="mt-6">
            <PriceTag price={product.price} oldPrice={product.oldPrice} size="lg" />
            <p className="mt-1 text-xs text-muted">Prix TTC, hors frais de livraison.</p>
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-card p-5 shadow-card">
            <AddToCart product={toSummary(product)} />
          </div>

          <section className="mt-8">
            <h2 className="text-lg font-bold text-ink">Description</h2>
            <p className="mt-2 leading-relaxed text-muted">{product.description}</p>
          </section>

          {product.highlights.length > 0 && (
            <section className="mt-6">
              <h2 className="text-lg font-bold text-ink">Points clés</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-ink">Dans la même catégorie</h2>
          <ProductGrid products={similar} />
        </section>
      )}
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12" aria-busy="true" aria-label="Chargement du produit">
      <div className="aspect-square animate-pulse rounded-3xl bg-line/60" />
      <div className="space-y-4">
        <div className="h-4 w-40 animate-pulse rounded bg-line/60" />
        <div className="h-10 w-3/4 animate-pulse rounded bg-line/60" />
        <div className="h-8 w-48 animate-pulse rounded bg-line/60" />
        <div className="h-32 animate-pulse rounded-2xl bg-line/60" />
      </div>
    </div>
  );
}
