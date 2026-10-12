import Form from "next/form";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Recherche globale : un formulaire GET vers /catalogue?q=...
 * Il fonctionne même sans JavaScript ; avec JavaScript, next/form
 * effectue une navigation côté client.
 */
export function SearchForm({ className, id = "search" }: { className?: string; id?: string }) {
  return (
    <Form action="/catalogue" role="search" className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        Rechercher un produit
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        id={id}
        name="q"
        type="search"
        maxLength={80}
        placeholder="Smartphone, PC, casque…"
        className="h-11 w-full rounded-xl border border-line bg-card pl-10 pr-24 text-sm text-ink placeholder:text-muted/80 focus:border-brand-600"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-brand-700 px-3 text-xs font-semibold text-white hover:bg-brand-800"
      >
        Rechercher
      </button>
    </Form>
  );
}
