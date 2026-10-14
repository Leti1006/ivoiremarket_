import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { DemoBanner } from "@/components/layout/demo-banner";
import { SearchForm } from "@/components/layout/search-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = { title: "Page introuvable" };

export default function NotFound() {
  // La page 404 est rendue hors du groupe (boutique) : on ajoute l'habillage ici.
  return (
    <>
      <DemoBanner />
      <SiteHeader />
      <main id="contenu" className="flex-1">
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 text-accent-600">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </span>
      <p className="mt-6 text-sm font-bold uppercase tracking-widest text-brand-700">Erreur 404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
        Cette page est introuvable
      </h1>
      <p className="mt-3 text-muted">
        Le lien est peut-être erroné ou le produit n&apos;est plus proposé. Essayez une recherche ou
        revenez à l&apos;accueil.
      </p>
      <SearchForm id="search-404" className="mt-8 w-full max-w-md" />
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClasses()}>Retour à l&apos;accueil</Link>
        <Link href="/catalogue" className={buttonClasses({ variant: "outline" })}>Voir le catalogue</Link>
      </div>
    </div>
      </main>
      <SiteFooter />
    </>
  );
}
