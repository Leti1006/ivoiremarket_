import { describe, expect, it } from "vitest";
import { seedProducts as products } from "@/data/seed-products";
import { catalogHref } from "@/features/products/catalog-url";
import { filterProducts, normalizeText, parseCatalogSearch } from "@/features/products/filters";
import { CATEGORY_IDS } from "@/types/product";

describe("données du catalogue", () => {
  it("a des identifiants et slugs uniques", () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it("couvre toutes les catégories avec des prix entiers positifs", () => {
    for (const id of CATEGORY_IDS) expect(products.some((p) => p.category === id)).toBe(true);
    for (const p of products) {
      expect(Number.isInteger(p.price)).toBe(true);
      expect(p.price).toBeGreaterThan(0);
      if (p.oldPrice !== undefined) expect(p.oldPrice).toBeGreaterThan(p.price);
    }
  });
});

describe("parseCatalogSearch", () => {
  it("applique des valeurs par défaut", () => {
    expect(parseCatalogSearch({})).toEqual({
      q: undefined,
      categorie: undefined,
      min: undefined,
      max: undefined,
      tri: "pertinence",
      dispo: false,
    });
  });

  it("ignore les valeurs invalides au lieu d'échouer", () => {
    const f = parseCatalogSearch({ categorie: "inconnue", min: "abc", max: "-5", tri: "hack" });
    expect(f.categorie).toBeUndefined();
    expect(f.min).toBeUndefined();
    expect(f.max).toBeUndefined();
    expect(f.tri).toBe("pertinence");
  });

  it("lit la première valeur d'un paramètre répété", () => {
    const f = parseCatalogSearch({ categorie: ["reseau", "smartphones"], min: "10 000" });
    expect(f.categorie).toBe("reseau");
    expect(f.min).toBe(10000);
  });
});

describe("filterProducts", () => {
  const all = (params: Record<string, string>) => filterProducts(products, parseCatalogSearch(params));

  it("recherche sans tenir compte des accents ni de la casse", () => {
    expect(normalizeText("Écouteurs")).toBe("ecouteurs");
    const results = all({ q: "ECOUTEURS" });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((p) => p.category === "ecouteurs")).toBe(true);
  });

  it("exige que tous les mots recherchés soient présents", () => {
    const results = all({ q: "samsung buds" });
    expect(results.map((p) => p.slug)).toEqual(["samsung-galaxy-buds-fe"]);
    expect(all({ q: "reconditionne" }).length).toBeGreaterThanOrEqual(2);
  });

  it("retourne une liste vide pour une recherche sans résultat", () => {
    expect(all({ q: "zzzzzz" })).toEqual([]);
  });

  it("filtre par catégorie et fourchette de prix", () => {
    const results = all({ categorie: "smartphones", min: "130000", max: "300000" });
    expect(results.length).toBeGreaterThan(0);
    for (const p of results) {
      expect(p.category).toBe("smartphones");
      expect(p.price).toBeGreaterThanOrEqual(130000);
      expect(p.price).toBeLessThanOrEqual(300000);
    }
  });

  it("remet dans l'ordre un minimum supérieur au maximum", () => {
    expect(all({ min: "300000", max: "130000" })).toEqual(all({ min: "130000", max: "300000" }));
  });

  it("trie par prix croissant et décroissant", () => {
    const asc = all({ tri: "prix-asc" }).map((p) => p.price);
    const desc = all({ tri: "prix-desc" }).map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it("place les produits épuisés après les produits disponibles (pertinence)", () => {
    const results = all({});
    const firstOut = results.findIndex((p) => p.stock === 0);
    expect(results.slice(firstOut).every((p) => p.stock === 0)).toBe(true);
  });

  it("masque les produits épuisés avec dispo=1", () => {
    expect(all({ dispo: "1" }).every((p) => p.stock > 0)).toBe(true);
  });
});

describe("catalogHref", () => {
  it("omet les valeurs par défaut", () => {
    expect(catalogHref({})).toBe("/catalogue");
    expect(catalogHref({ tri: "pertinence" })).toBe("/catalogue");
  });

  it("encode les paramètres", () => {
    expect(catalogHref({ q: "hp & dell", categorie: "ordinateurs", tri: "prix-asc" })).toBe(
      "/catalogue?q=hp+%26+dell&categorie=ordinateurs&tri=prix-asc",
    );
  });
});
