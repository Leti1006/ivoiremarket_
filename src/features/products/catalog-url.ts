import type { CatalogFilters } from "./filters";

/** Construit une URL /catalogue à partir des filtres, en omettant les valeurs par défaut. */
export function catalogHref(filters: Partial<CatalogFilters>): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.categorie) params.set("categorie", filters.categorie);
  if (filters.min !== undefined) params.set("min", String(filters.min));
  if (filters.max !== undefined) params.set("max", String(filters.max));
  if (filters.dispo) params.set("dispo", "1");
  if (filters.tri && filters.tri !== "pertinence") params.set("tri", filters.tri);
  const query = params.toString();
  return query ? `/catalogue?${query}` : "/catalogue";
}
