"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { changeOrderStatusAction, type StatusFormState } from "../actions";
import { STATUS_LABELS, STATUS_TRANSITIONS, type OrderStatus } from "../order-status";

/** Boutons d'action proposant uniquement les transitions autorisées. */
export function OrderStatusForm({ id, status }: { id: number; status: OrderStatus }) {
  const [state, formAction, pending] = useActionState<StatusFormState, FormData>(changeOrderStatusAction, {});
  const next = STATUS_TRANSITIONS[status];

  if (next.length === 0) {
    return <p className="text-sm text-muted">Cette commande est clôturée : son statut ne peut plus changer.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap gap-2">
        {next.map((s) => (
          <button
            key={s}
            type="submit"
            name="status"
            value={s}
            disabled={pending}
            className={buttonClasses({
              variant: s === "annulee" ? "outline" : "primary",
              className: s === "annulee" ? "border-danger/40 text-danger hover:border-danger hover:text-danger" : undefined,
            })}
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {s === "annulee" ? "Annuler la commande" : `Marquer « ${STATUS_LABELS[s]} »`}
          </button>
        ))}
      </div>
      {next.includes("annulee") && (
        <p className="text-xs text-muted">Une annulation remet automatiquement les articles en stock.</p>
      )}
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.success && <p role="status" className="text-sm text-brand-700">{state.success}</p>}
    </form>
  );
}
