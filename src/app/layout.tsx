import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { DemoBanner } from "@/components/layout/demo-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

// La police est téléchargée au moment du build puis servie par l'application
// elle-même : aucune requête vers Google depuis le navigateur des visiteurs.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IvoireMarket — High-tech et électronique en Côte d'Ivoire",
    template: "%s | IvoireMarket",
  },
  description:
    "Boutique de démonstration : smartphones, ordinateurs, audio, accessoires et équipements réseau, avec des prix en FCFA.",
  applicationName: "IvoireMarket",
};

export const viewport: Viewport = {
  themeColor: "#063726",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#contenu"
          className="sr-only z-50 rounded-lg bg-brand-700 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Aller au contenu
        </a>
        <DemoBanner />
        <SiteHeader />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
