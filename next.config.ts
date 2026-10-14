import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Politique de sécurité du contenu (CSP) : seules les ressources servies
 * par l'application elle-même sont autorisées. Next.js injecte des scripts
 * en ligne pour l'hydratation, d'où 'unsafe-inline' ; 'unsafe-eval' n'est
 * nécessaire qu'en développement (rechargement à chaud).
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  // Produit un serveur autonome minimal dans .next/standalone (utilisé par le Dockerfile).
  output: "standalone",
  // Ne pas annoncer la technologie du serveur dans l'en-tête X-Powered-By.
  poweredByHeader: false,
  // Les photos sont optimisées une fois pour toutes, à l'avance (WebP en
  // 600 px et 1200 px) : le serveur n'a aucun encodage d'image à faire, ce
  // qui compte sur une petite instance (t3.micro). L'optimiseur intégré est
  // donc désactivé (il ralentissait fortement le serveur lors des tests).
  images: {
    unoptimized: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
