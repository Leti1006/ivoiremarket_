import Form from "next/form";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { categories } from "@/data/categories";
import type { CatalogFilters } from "../filters";

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink focus:border-brand-600";

/**
 * Formulaire de filtres (GET). Chaque champ devient un paramètre d'URL :
 * les résultats sont donc partageables et le bouton « retour » fonctionne.
 */
export function CatalogFiltersForm({ filters }: { filters: CatalogFilters }) {
  return (
    <Form
      action="/catalogue"
      // Une nouvelle clé recrée le formulaire quand l'URL change, pour
      // que les valeurs affichées restent synchronisées avec les filtres.
      key={JSON.stringify(filters)}
      className="space-y-5 rounded-2xl border border-line bg-card p-5 shadow-card"
      aria-label="Filtres du catalogue"
    >
      {filters.tri !== "pertinence" && <input type="hidden" name="tri" value={filters.tri} />}

      <div className="space-y-1.5">
        <label htmlFor="filter-q" className="text-sm font-semibold text-ink">Recherche</label>
        <input
          id="filter-q"
          name="q"
          type="search"
          maxLength={80}
          defaultValue={filters.q ?? ""}
          placeholder="Marque, modèle…"
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="filter-categorie" className="text-sm font-semibold text-ink">Catégorie</label>
        <select id="filter-categorie" name="categorie" defaultValue={filters.categorie ?? ""} className={inputClass}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-1.5">
        <legend className="text-sm font-semibold text-ink">Prix (FCFA)</legend>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="filter-min" className="sr-only">Prix minimum en FCFA</label>
            <input
              id="filter-min"
              name="min"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              placeholder="Min"
              defaultValue={filters.min ?? ""}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="filter-max" className="sr-only">Prix maximum en FCFA</label>
            <input
              id="filter-max"
              name="max"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              placeholder="Max"
              defaultValue={filters.max ?? ""}
              className={inputClass}
            />
          </div>
        </div>
      </fieldset>

      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          name="dispo"
          value="1"
          defaultChecked={filters.dispo}
          className="h-4 w-4 rounded border-line accent-brand-700"
        />
        Produits disponibles uniquement
      </label>

      <div className="flex flex-col gap-2">
        <button type="submit" className={buttonClasses({ className: "w-full" })}>
          Appliquer les filtres
        </button>
        <Link href="/catalogue" className={buttonClasses({ variant: "ghost", className: "w-full" })}>
          Réinitialiser
        </Link>
      </div>
    </Form>
  );
}
