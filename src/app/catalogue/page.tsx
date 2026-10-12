import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { SearchX } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { categories, getCategory } from "@/data/categories";
import { catalogHref } from "@/features/products/catalog-url";
import { AutoSubmitSelect } from "@/features/products/components/auto-submit-select";
import { CatalogFiltersForm } from "@/features/products/components/catalog-filters";
import { FiltersPanel } from "@/features/products/components/filters-panel";
import { ProductGrid } from "@/features/products/components/product-card";
import {
  SORT_OPTIONS,
  filterProducts,
  hasActiveFilters,
  parseCatalogSearch,
  type CatalogFilters,
} from "@/features/products/filters";
import { getAllProducts } from "@/features/products/queries";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Catalogue",
  description: "Recherchez, filtrez et comparez nos produits électroniques et high-tech.",
};

export default function CataloguePage({ searchParams }: PageProps<"/catalogue">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <h1 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Catalogue</h1>
      <p className="mt-1 text-muted">
        Catalogue de démonstration : prix et stocks fictifs, affichés en francs CFA.
      </p>
      {/* Les paramètres d'URL sont des données de requête : on les lit dans
          un composant enveloppé par Suspense (exigence de Cache Components). */}
      <Suspense fallback={<CatalogSkeleton />}>
        <CatalogResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CatalogResults({ searchParams }: Pick<PageProps<"/catalogue">, "searchParams">) {
  const filters = parseCatalogSearch(await searchParams);
  const results = filterProducts(getAllProducts(), filters);
  const activeCount = [
    filters.q,
    filters.categorie,
    filters.min !== undefined || filters.max !== undefined,
    filters.dispo,
  ].filter(Boolean).length;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8">
      <aside>
        <FiltersPanel activeCount={activeCount}>
          <CatalogFiltersForm filters={filters} />
        </FiltersPanel>
      </aside>

      <section aria-label="Résultats" className="min-w-0">
        <CategoryChips filters={filters} />

        <div className="mb-5 mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite" data-testid="results-count">
            <strong className="text-ink">{results.length}</strong> produit{results.length > 1 ? "s" : ""}
            {describeFilters(filters)}
          </p>
          <SortForm filters={filters} />
        </div>

        {results.length > 0 ? <ProductGrid products={results} /> : <EmptyResults filters={filters} />}
      </section>
    </div>
  );
}

function describeFilters(filters: CatalogFilters): string {
  const parts: string[] = [];
  if (filters.q) parts.push(`pour « ${filters.q} »`);
  if (filters.categorie) parts.push(`dans ${getCategory(filters.categorie).name}`);
  if (filters.min !== undefined) parts.push(`à partir de ${formatPrice(filters.min)}`);
  if (filters.max !== undefined) parts.push(`jusqu'à ${formatPrice(filters.max)}`);
  return parts.length ? ` ${parts.join(", ")}` : "";
}

function CategoryChips({ filters }: { filters: CatalogFilters }) {
  const chip = (active: boolean) =>
    cn(
      "inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors",
      active
        ? "border-brand-700 bg-brand-700 text-white"
        : "border-line bg-card text-ink hover:border-brand-600 hover:text-brand-700",
    );

  return (
    <nav aria-label="Catégories" className="-mx-4 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
      <ul className="flex gap-2">
        <li>
          <Link
            href={catalogHref({ ...filters, categorie: undefined })}
            className={chip(!filters.categorie)}
            aria-current={!filters.categorie ? "page" : undefined}
          >
            Tout
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={catalogHref({ ...filters, categorie: c.id })}
              className={chip(filters.categorie === c.id)}
              aria-current={filters.categorie === c.id ? "page" : undefined}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function SortForm({ filters }: { filters: CatalogFilters }) {
  return (
    <Form action="/catalogue" className="flex items-center gap-2" key={`sort-${JSON.stringify(filters)}`}>
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      {filters.categorie && <input type="hidden" name="categorie" value={filters.categorie} />}
      {filters.min !== undefined && <input type="hidden" name="min" value={filters.min} />}
      {filters.max !== undefined && <input type="hidden" name="max" value={filters.max} />}
      {filters.dispo && <input type="hidden" name="dispo" value="1" />}
      <label htmlFor="sort" className="text-sm text-muted">Trier par</label>
      <AutoSubmitSelect
        id="sort"
        name="tri"
        defaultValue={filters.tri}
        className="h-10 rounded-xl border border-line bg-card px-3 text-sm font-medium text-ink"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </AutoSubmitSelect>
      <noscript>
        <button type="submit" className={buttonClasses({ size: "sm", variant: "outline" })}>OK</button>
      </noscript>
    </Form>
  );
}

function EmptyResults({ filters }: { filters: CatalogFilters }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-card px-6 py-14 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-50 text-accent-600">
        <SearchX className="h-7 w-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-ink">Aucun produit ne correspond à votre recherche</h2>
      <p className="mt-1 max-w-md text-sm text-muted">
        Vérifiez l&apos;orthographe, élargissez la fourchette de prix ou essayez une autre catégorie.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {hasActiveFilters(filters) && (
          <Link href="/catalogue" className={buttonClasses()}>Voir tous les produits</Link>
        )}
        {filters.categorie && (
          <Link href={catalogHref({ categorie: filters.categorie })} className={buttonClasses({ variant: "outline" })}>
            Toute la catégorie {getCategory(filters.categorie).name}
          </Link>
        )}
      </div>
    </div>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8" aria-busy="true" aria-label="Chargement du catalogue">
      <div className="hidden h-96 animate-pulse rounded-2xl bg-line/60 lg:block" />
      <div>
        <div className="h-9 w-2/3 animate-pulse rounded-full bg-line/60" />
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-line/60" />
          ))}
        </ul>
      </div>
    </div>
  );
}
