"use client";

import { useActionState } from "react";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { loginAction, type LoginState } from "../actions";

const inputClass =
  "h-11 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink focus:border-brand-600";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p role="alert" className="flex gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {state.error}
        </p>
      )}
      <div className="space-y-1.5">
        <label htmlFor="username" className="text-sm font-semibold text-ink">Identifiant</label>
        <input id="username" name="username" autoComplete="username" required maxLength={100} className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-ink">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={pending} className={buttonClasses({ size: "lg", className: "w-full" })}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
        Se connecter
      </button>
    </form>
  );
}
