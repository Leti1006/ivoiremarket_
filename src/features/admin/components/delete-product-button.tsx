"use client";

import { Trash2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { deleteProductAction } from "../actions";

/** Suppression avec confirmation : l'action est irréversible. */
export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProductAction}
      onSubmit={(event) => {
        if (!window.confirm(`Supprimer définitivement « ${name} » ? Les commandes passées restent consultables.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={buttonClasses({ variant: "outline", className: "border-danger/40 text-danger hover:border-danger hover:text-danger" })}>
        <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer
      </button>
    </form>
  );
}
