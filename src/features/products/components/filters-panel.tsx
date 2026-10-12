"use client";

import { useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";

/** Sur mobile, les filtres sont repliés derrière un bouton ; sur grand écran ils restent visibles. */
export function FiltersPanel({ children, activeCount }: { children: ReactNode; activeCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="catalog-filters"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-card text-sm font-semibold text-ink lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        {open ? "Masquer les filtres" : "Afficher les filtres"}
        {activeCount > 0 && (
          <span className="rounded-full bg-brand-700 px-2 py-0.5 text-xs text-white">{activeCount}</span>
        )}
      </button>
      <div id="catalog-filters" className={cn("mt-3 lg:mt-0 lg:block", open ? "block" : "hidden")}>
        {children}
      </div>
    </div>
  );
}
