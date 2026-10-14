import { NextResponse, type NextRequest } from "next/server";
import { getAdminConfig, SESSION_COOKIE, verifySessionToken } from "@/server/auth";
import { findProductBySlug } from "@/server/products-repo";

/**
 * Proxy : s'exécute avant le rendu des pages.
 *
 * 1. /produits/:slug — les fiches sont rendues en streaming : un notFound()
 *    déclenché dans la page arriverait après l'envoi du statut 200. On
 *    vérifie donc ici que le produit existe pour renvoyer un vrai 404.
 * 2. /admin/* — un visiteur sans session valide est redirigé vers la page de
 *    connexion. (Chaque page et action vérifie aussi la session elle-même.)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/produits/")) {
    let slug = "";
    try {
      slug = decodeURIComponent(pathname.split("/")[2] ?? "");
    } catch {
      // URL mal encodée : traitée comme un produit inconnu.
    }
    if (slug && findProductBySlug(slug)) return NextResponse.next();
    // Réécriture vers une route inexistante : Next.js sert alors la page 404.
    return NextResponse.rewrite(new URL("/404", request.url), { status: 404 });
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/connexion") {
    const config = getAdminConfig();
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!config || !verifySessionToken(config.secret, token)) {
      return NextResponse.redirect(new URL("/admin/connexion", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/produits/:slug", "/admin", "/admin/:path*"],
};
