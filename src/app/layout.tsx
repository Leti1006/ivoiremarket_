import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
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
    "Smartphones, ordinateurs, audio, accessoires et équipements réseau, avec des prix en FCFA et le paiement à la livraison.",
  applicationName: "IvoireMarket",
};

export const viewport: Viewport = {
  themeColor: "#063726",
};

/** Layout racine, commun à la boutique et à l'administration. */
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
        {children}
      </body>
    </html>
  );
}
