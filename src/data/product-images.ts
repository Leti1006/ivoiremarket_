import credits from "./image-credits.json";

/**
 * Photothèque : photos réelles provenant de Wikimedia Commons, sous licences
 * libres (CC0, CC BY, CC BY-SA). L'auteur et la licence doivent être cités :
 * ils sont affichés sur chaque fiche produit et sur la page /credits.
 */
export type ProductImage = {
  key: string;
  /** Version 1200 px (fiche produit). */
  file: string;
  /** Version 600 px (cartes, listes, miniatures). */
  thumb: string;
  width: number;
  height: number;
  title: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
};

const LIBRARY: Record<string, ProductImage> = Object.fromEntries(
  Object.entries(credits).map(([key, value]) => [key, { key, ...value }]),
);

export function getProductImage(key: string | undefined | null): ProductImage | undefined {
  return key ? LIBRARY[key] : undefined;
}

export function listProductImages(): ProductImage[] {
  return Object.values(LIBRARY).sort((a, b) => a.key.localeCompare(b.key));
}

export function isKnownImage(key: string): boolean {
  return key in LIBRARY;
}
