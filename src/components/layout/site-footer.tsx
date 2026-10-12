import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { categories } from "@/data/categories";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-brand-900 text-brand-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-extrabold text-white">IvoireMarket</span>
          </div>
          <p className="text-sm leading-relaxed text-brand-100/80">
            Boutique en ligne de démonstration dédiée à l&apos;électronique et au high-tech en Côte
            d&apos;Ivoire. Prix affichés en francs CFA.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Catégories</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/catalogue?categorie=${c.id}`} className="hover:text-accent-500">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">Boutique</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/catalogue" className="hover:text-accent-500">Tout le catalogue</Link></li>
            <li><Link href="/catalogue?tri=prix-asc" className="hover:text-accent-500">Petits prix</Link></li>
            <li><Link href="/panier" className="hover:text-accent-500">Mon panier</Link></li>
            <li><Link href="/commande" className="hover:text-accent-500">Passer commande</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">À propos du projet</h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-100/80">
            Application réalisée dans le cadre d&apos;un projet universitaire de cloud computing
            (Next.js, Docker, AWS EC2). Les produits, prix et stocks sont fictifs ; aucune donnée
            saisie n&apos;est conservée.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-brand-100/70">
          © 2026 IvoireMarket — projet de démonstration. Les marques citées appartiennent à leurs
          propriétaires respectifs.
        </p>
      </div>
    </footer>
  );
}
