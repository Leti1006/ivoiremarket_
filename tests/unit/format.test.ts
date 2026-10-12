import { describe, expect, it } from "vitest";
import { discountPercent, formatPrice } from "@/lib/format";

const NBSP = " ";

describe("formatPrice", () => {
  it("sépare les milliers et ajoute FCFA", () => {
    expect(formatPrice(259000)).toBe(`259${NBSP}000${NBSP}FCFA`);
    expect(formatPrice(1250000)).toBe(`1${NBSP}250${NBSP}000${NBSP}FCFA`);
  });

  it("gère les petits montants et zéro", () => {
    expect(formatPrice(0)).toBe(`0${NBSP}FCFA`);
    expect(formatPrice(950)).toBe(`950${NBSP}FCFA`);
  });

  it("arrondit les montants non entiers", () => {
    expect(formatPrice(1999.6)).toBe(`2${NBSP}000${NBSP}FCFA`);
  });
});

describe("discountPercent", () => {
  it("calcule le pourcentage de réduction arrondi", () => {
    expect(discountPercent(259000, 285000)).toBe(9);
    expect(discountPercent(50, 100)).toBe(50);
  });

  it("retourne 0 sans réduction réelle", () => {
    expect(discountPercent(100, 100)).toBe(0);
    expect(discountPercent(120, 100)).toBe(0);
    expect(discountPercent(10, 0)).toBe(0);
  });
});
