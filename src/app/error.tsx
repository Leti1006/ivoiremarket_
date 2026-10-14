"use client";

import Link from "next/link";
import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Le détail reste dans la console ; l'utilisateur voit un message neutre.
    console.error(error);
  }, [error]);

  return (
    <main id="contenu" className="mx-auto flex max-w-2xl flex-1 flex-col items-center px-4 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50 text-danger">
        <TriangleAlert className="h-8 w-8" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-ink">Une erreur est survenue</h1>
      <p className="mt-3 text-muted">
        Le chargement de cette page a échoué. Vous pouvez réessayer ou revenir à l&apos;accueil.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className={buttonClasses()}>Réessayer</button>
        <Link href="/" className={buttonClasses({ variant: "outline" })}>Accueil</Link>
      </div>
    </main>
  );
}
