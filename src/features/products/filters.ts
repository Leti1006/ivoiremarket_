import { z } from "zod";
import { categories } from "@/data/categories";
import { CATEGORY_IDS, type Product } from "@/types/product";

export const SORT_OPTIONS = [
  { value: "pertinence", label: "Pertinence" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const SORT_VALUES = SORT_OPTIONS.map((o) => o.value) as [SortOption, ...SortOption[]];

/** Un paramètre d'URL peut être absent, unique ou répété : on garde la première valeur. */
const firstValue = (v: unknown) => (Array.isArray(v) ? v[0] : v);

/** Champ prix optionnel : vide ou invalide => ignoré, au lieu de faire échouer la page. */
const priceParam = z.preprocess(
  (v) => {
    const raw = firstValue(v);
    if (typeof raw !== "string" || raw.trim() === "") return undefined;
    return Number(raw.replace(/\s/g, ""));
  },
  z.number().int().nonnegative().max(100_000_000).optional().catch(undefined),
);

/**
 * Schéma de validation des paramètres de recherche du catalogue.
 * Toute valeur invalide est remplacée par une valeur par défaut sûre.
 */
export const catalogSearchSchema = z.object({
  q: z.preprocess(
    firstValue,
    z.string().trim().max(80).optional().catch(undefined),
  ),
  categorie: z.preprocess(firstValue, z.enum(CATEGORY_IDS).optional().catch(undefined)),
  min: priceParam,
  max: priceParam,
  tri: z.preprocess(firstValue, z.enum(SORT_VALUES).catch("pertinence")).default("pertinence"),
  dispo: z.preprocess((v) => firstValue(v) === "1", z.boolean()),
});

export type CatalogFilters = z.infer<typeof catalogSearchSchema>;

export function parseCatalogSearch(
  params: Record<string, string | string[] | undefined>,
): CatalogFilters {
  return catalogSearchSchema.parse(params);
}

/** Minuscules et sans accents : "Écouteurs" -> "ecouteurs". */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function categoryName(product: Product): string {
  return categories.find((c) => c.id === product.category)?.name ?? "";
}

/**
 * Score de pertinence d'un produit pour une recherche.
 * Retourne 0 si un des mots recherchés est introuvable.
 */
export function relevanceScore(product: Product, query: string): number {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return 1;

  const name = normalizeText(product.name);
  const brand = normalizeText(product.brand);
  const category = normalizeText(categoryName(product));
  const details = normalizeText(`${product.description} ${product.highlights.join(" ")}`);

  let score = 0;
  for (const term of terms) {
    let termScore = 0;
    if (name.includes(term)) termScore += 3;
    if (brand.includes(term)) termScore += 2;
    if (category.includes(term)) termScore += 2;
    if (details.includes(term)) termScore += 1;
    if (termScore === 0) return 0;
    score += termScore;
  }
  return score;
}

export function filterProducts(list: Product[], filters: CatalogFilters): Product[] {
  let { min, max } = filters;
  // Si l'utilisateur inverse le minimum et le maximum, on les remet dans l'ordre.
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];

  const scored = list
    .map((product, index) => ({
      product,
      index,
      score: filters.q ? relevanceScore(product, filters.q) : 1,
    }))
    .filter(({ product, score }) => {
      if (score === 0) return false;
      if (filters.categorie && product.category !== filters.categorie) return false;
      if (min !== undefined && product.price < min) return false;
      if (max !== undefined && product.price > max) return false;
      if (filters.dispo && product.stock <= 0) return false;
      return true;
    });

  scored.sort((a, b) => {
    switch (filters.tri) {
      case "prix-asc":
        return a.product.price - b.product.price || a.index - b.index;
      case "prix-desc":
        return b.product.price - a.product.price || a.index - b.index;
      default:
        // Pertinence : meilleur score, puis produits disponibles, puis mis en avant.
        return (
          b.score - a.score ||
          Number(b.product.stock > 0) - Number(a.product.stock > 0) ||
          Number(b.product.featured) - Number(a.product.featured) ||
          a.index - b.index
        );
    }
  });

  return scored.map(({ product }) => product);
}

/** Vrai si au moins un filtre restreint la liste. */
export function hasActiveFilters(filters: CatalogFilters): boolean {
  return Boolean(
    filters.q || filters.categorie || filters.min !== undefined || filters.max !== undefined || filters.dispo,
  );
}
