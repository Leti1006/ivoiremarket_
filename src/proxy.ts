import { NextResponse, type NextRequest } from "next/server";
import { products } from "@/data/products";

const KNOWN_SLUGS = new Set(products.map((p) => p.slug));

/**
 * Les fiches produits sont rendues en streaming : un notFound() déclenché
 * dans la page arriverait après l'envoi du statut 200. On vérifie donc le
 * slug ici, avant le rendu, pour renvoyer un vrai code HTTP 404.
 */
export function proxy(request: NextRequest) {
  let slug = "";
  try {
    slug = decodeURIComponent(request.nextUrl.pathname.split("/")[2] ?? "");
  } catch {
    // URL mal encodée : traitée comme un produit inconnu.
  }
  if (KNOWN_SLUGS.has(slug)) return NextResponse.next();
  // Réécriture vers une route inexistante : Next.js sert alors la page 404.
  return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
}

export const config = {
  matcher: "/produits/:slug",
};
