import { Info } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="bg-brand-900 text-brand-50">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-xs sm:text-sm">
        <Info className="h-4 w-4 shrink-0 text-accent-500" aria-hidden="true" />
        <span>
          Boutique de démonstration (projet universitaire) : aucune vente, aucun paiement et
          aucune livraison réels.
        </span>
      </p>
    </div>
  );
}
