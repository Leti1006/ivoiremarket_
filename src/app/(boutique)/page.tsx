import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Banknote, ShieldCheck, Tags, Truck } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { categories } from "@/data/categories";
import { FREE_DELIVERY_THRESHOLD } from "@/data/delivery-zones";
import { CATEGORY_ICONS } from "@/features/products/components/category-icon";
import { ProductGrid } from "@/features/products/components/product-card";
import { ProductPhoto } from "@/features/products/components/product-photo";
import { countByCategory, getFeaturedProducts, getPromotions } from "@/features/products/queries";
import { getCatalog } from "@/server/catalog";
import { formatPrice } from "@/lib/format";

const ADVANTAGES = [
  {
    icon: Truck,
    title: "Livraison partout en Côte d'Ivoire",
    text: `Abidjan à partir de ${formatPrice(2_000)}, offerte dès ${formatPrice(FREE_DELIVERY_THRESHOLD)} d'achat.`,
  },
  {
    icon: Banknote,
    title: "Paiement à la livraison",
    text: "Aucune carte bancaire n'est demandée : vous payez à la réception.",
  },
  {
    icon: Tags,
    title: "Prix clairs en FCFA",
    text: "Frais de livraison affichés avant validation, sans surprise.",
  },
  {
    icon: ShieldCheck,
    title: "Données minimales",
    text: "Seuls un nom, un téléphone et une adresse sont demandés.",
  },
];

function SectionHeading({ title, subtitle, href, linkLabel }: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
          {linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

// Photos de la bannière (décoratives) : elles ne dépendent pas de la base.
const HERO_PHOTOS = [
  { name: "MacBook Air M2", category: "ordinateurs", image: "apple-macbook-air-m2" },
  { name: "Samsung Galaxy A55", category: "smartphones", image: "samsung-galaxy-a55" },
  { name: "Casque Sony WH-1000XM3", category: "ecouteurs", image: "sony-wh-1000xm3" },
] as const;

export default function HomePage() {
  return (
    <>
      {/* --- Bannière principale --- */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "22px 22px" }}
          aria-hidden="true"
        />
        <div className="absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-accent-500/25 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-2">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-accent-100">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
              Électronique & high-tech à Abidjan
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              La technologie qui vous ressemble,{" "}
              <span className="text-accent-500">au juste prix en FCFA.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-brand-100/90">
              Smartphones, ordinateurs, audio et équipements réseau : comparez, choisissez et
              commandez en quelques clics, puis payez à la livraison.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalogue" className={buttonClasses({ variant: "accent", size: "lg" })}>
                Découvrir le catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/catalogue?categorie=smartphones"
                className={buttonClasses({ size: "lg", className: "border border-white/25 bg-white/10 hover:bg-white/20" })}
              >
                Voir les smartphones
              </Link>
            </div>
          </div>

          <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4 lg:max-w-lg" aria-hidden="true">
            <ProductPhoto
              product={HERO_PHOTOS[0]}
              sizes="(min-width: 1024px) 512px, 90vw"
              preload
              variant="full"
              className="col-span-2 aspect-[16/10] bg-white shadow-lift"
            />
            {HERO_PHOTOS.slice(1).map((p) => (
              <ProductPhoto key={p.image} product={p} sizes="(min-width: 1024px) 250px, 45vw" className="bg-white shadow-lift" />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 sm:space-y-20">
        {/* Les sections suivantes lisent la base : elles arrivent en streaming. */}
        <Suspense fallback={<SectionsSkeleton />}>
          <CatalogSections />
        </Suspense>

        {/* --- Avantages --- */}
        <section aria-labelledby="avantages-title">
          <h2 id="avantages-title" className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Pourquoi commander sur IvoireMarket ?
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANTAGES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="rounded-2xl border border-line bg-card p-5 shadow-card">
                <Icon className="h-6 w-6 text-accent-600" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">
            Conditions de démonstration : ces engagements décrivent le fonctionnement simulé de la
            boutique et ne correspondent à aucun service commercial réel.
          </p>
        </section>
      </div>
    </>
  );
}

async function CatalogSections() {
  const catalog = await getCatalog();
  const featured = getFeaturedProducts(catalog, 8);
  const promotions = getPromotions(catalog, 4);
  const counts = countByCategory(catalog);

  return (
    <>
        {/* --- Catégories --- */}
        <section>
          <SectionHeading title="Nos catégories" subtitle="Tout l'équipement numérique, au même endroit." />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const Icon = CATEGORY_ICONS[category.id];
              return (
                <li key={category.id}>
                  <Link
                    href={`/catalogue?categorie=${category.id}`}
                    className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-lift"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{category.name}</span>
                      <span className="text-sm text-muted">
                        {counts[category.id] ?? 0} produit{(counts[category.id] ?? 0) > 1 ? "s" : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* --- Produits mis en avant --- */}
        <section>
          <SectionHeading
            title="Sélection du moment"
            subtitle="Une sélection de notre catalogue pour les études, le bureau et la maison."
            href="/catalogue"
            linkLabel="Tout voir"
          />
          <ProductGrid products={featured} />
        </section>

        {/* --- Promotions (démonstration) --- */}
        <section className="rounded-3xl bg-accent-50 p-5 sm:p-8">
          <SectionHeading
            title="Promotions"
            subtitle="Offres du moment (démonstration : les prix barrés sont fictifs)."
            href="/catalogue?tri=prix-asc"
            linkLabel="Voir les petits prix"
          />
          <ProductGrid products={promotions} />
        </section>

    </>
  );
}

function SectionsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement des produits">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-line/60" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-line/60" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-line/60" />
        ))}
      </div>
    </div>
  );
}
