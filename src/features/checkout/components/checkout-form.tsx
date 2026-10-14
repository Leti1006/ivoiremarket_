"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { AlertCircle, Loader2, Lock } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { DELIVERY_ZONES, deliveryFee, type DeliveryZoneId } from "@/data/delivery-zones";
import { OrderSummary } from "@/features/cart/components/order-summary";
import { useCart } from "@/features/cart/use-cart";
import { formatPrice } from "@/lib/format";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/cn";
import type { ProductSummary } from "@/types/product";
import { placeDemoOrder } from "../actions";
import { checkoutFormSchema, type CheckoutField } from "../checkout-schema";
import { saveLastOrder } from "../order-storage";

type FormValues = Record<CheckoutField, string>;
type FieldErrors = Partial<Record<CheckoutField, string>>;

const EMPTY_VALUES: FormValues = { fullName: "", phone: "", email: "", zone: "", address: "", note: "" };
const FIELD_ORDER: CheckoutField[] = ["fullName", "phone", "email", "zone", "address", "note"];

const inputClass = (invalid: boolean) =>
  cn(
    "w-full rounded-xl border bg-card px-3 text-sm text-ink placeholder:text-muted/70",
    invalid ? "border-danger focus:border-danger" : "border-line focus:border-brand-600",
  );

function Field({
  id,
  label,
  error,
  hint,
  optional,
  children,
}: {
  id: CheckoutField;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label} {optional && <span className="font-normal text-muted">(facultatif)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export function CheckoutForm({ catalog }: { catalog: ProductSummary[] }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const { lines, count, subtotal, clear } = useCart(catalog);
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [pending, startTransition] = useTransition();

  const zone = values.zone as DeliveryZoneId | "";
  const fee = zone ? deliveryFee(zone, subtotal) : undefined;

  const set = (field: CheckoutField) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const a11y = (field: CheckoutField, hasHint = false) => ({
    id: field,
    name: field,
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : hasHint ? `${field}-hint` : undefined,
  });

  function focusFirstError(fieldErrors: FieldErrors) {
    const first = FIELD_ORDER.find((f) => fieldErrors[f]);
    if (first) document.getElementById(first)?.focus();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    // 1) Validation immédiate dans le navigateur, pour un retour rapide.
    const parsed = checkoutFormSchema.safeParse(values);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as CheckoutField;
        fieldErrors[field] ??= issue.message;
      }
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }

    // 2) Validation définitive et calcul du total par le serveur.
    startTransition(async () => {
      try {
        const result = await placeDemoOrder(
          values,
          lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        );
        if (!result.ok) {
          if (result.fieldErrors) {
            setErrors(result.fieldErrors);
            focusFirstError(result.fieldErrors);
          }
          setFormError(result.formError ?? "Certaines informations sont invalides.");
          return;
        }
        saveLastOrder(result.order);
        setRedirecting(true);
        router.push("/commande/confirmation");
        clear();
      } catch {
        setFormError("Le serveur n'a pas pu traiter la commande. Vérifiez votre connexion et réessayez.");
      }
    });
  }

  if (!hydrated) {
    return <div className="mt-8 h-96 animate-pulse rounded-2xl bg-line/60" aria-busy="true" aria-label="Chargement" />;
  }

  if (redirecting) {
    return (
      <p className="mt-8 flex items-center gap-2 text-muted" role="status">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Commande validée, redirection…
      </p>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-line bg-card px-6 py-14 text-center">
        <h2 className="text-xl font-bold text-ink">Votre panier est vide</h2>
        <p className="mt-1 text-sm text-muted">Ajoutez au moins un produit avant de passer commande.</p>
        <Link href="/catalogue" className={buttonClasses({ className: "mt-6" })}>Voir le catalogue</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_24rem]">
      <div className="space-y-6 rounded-2xl border border-line bg-card p-5 shadow-card sm:p-7">
        {formError && (
          <div role="alert" className="flex gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {formError}
          </div>
        )}

        <fieldset className="space-y-4">
          <legend className="mb-1 text-lg font-bold text-ink">Vos coordonnées</legend>
          <Field id="fullName" label="Nom complet" error={errors.fullName}>
            <input
              {...a11y("fullName")}
              autoComplete="name"
              maxLength={80}
              value={values.fullName}
              onChange={(e) => set("fullName")(e.target.value)}
              className={cn(inputClass(!!errors.fullName), "h-11")}
              placeholder="Ex. Aya Konan"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="phone" label="Téléphone" error={errors.phone} hint="Numéro ivoirien à 10 chiffres.">
              <input
                {...a11y("phone", true)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={20}
                value={values.phone}
                onChange={(e) => set("phone")(e.target.value)}
                className={cn(inputClass(!!errors.phone), "h-11")}
                placeholder="07 00 00 00 00"
              />
            </Field>
            <Field id="email" label="E-mail" optional error={errors.email}>
              <input
                {...a11y("email")}
                type="email"
                autoComplete="email"
                maxLength={120}
                value={values.email}
                onChange={(e) => set("email")(e.target.value)}
                className={cn(inputClass(!!errors.email), "h-11")}
                placeholder="vous@exemple.ci"
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="mb-1 text-lg font-bold text-ink">Livraison</legend>
          <Field id="zone" label="Zone de livraison" error={errors.zone}>
            <select
              {...a11y("zone")}
              value={values.zone}
              onChange={(e) => set("zone")(e.target.value)}
              className={cn(inputClass(!!errors.zone), "h-11")}
            >
              <option value="">Choisissez votre zone…</option>
              {DELIVERY_ZONES.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.label} — {formatPrice(z.fee)}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="address"
            label="Adresse ou point de repère"
            error={errors.address}
            hint="Quartier, rue, immeuble ou repère connu."
          >
            <textarea
              {...a11y("address", true)}
              rows={3}
              maxLength={200}
              autoComplete="street-address"
              value={values.address}
              onChange={(e) => set("address")(e.target.value)}
              className={cn(inputClass(!!errors.address), "py-2.5")}
              placeholder="Ex. Riviera 2, près de la pharmacie…"
            />
          </Field>
          <Field id="note" label="Instructions pour le livreur" optional error={errors.note}>
            <textarea
              {...a11y("note")}
              rows={2}
              maxLength={300}
              value={values.note}
              onChange={(e) => set("note")(e.target.value)}
              className={cn(inputClass(!!errors.note), "py-2.5")}
            />
          </Field>
        </fieldset>

        <div className="rounded-xl border border-accent-100 bg-accent-50 p-4 text-sm text-accent-700">
          <p className="font-semibold">Paiement à la livraison (démonstration)</p>
          <p className="mt-1">
            Aucune information bancaire n&apos;est demandée. Votre commande est enregistrée pour être
            suivie dans l&apos;espace administrateur, mais rien ne sera réellement livré ni facturé :
            n&apos;utilisez pas vos vraies coordonnées.
          </p>
        </div>
      </div>

      <div className="space-y-3 lg:sticky lg:top-36">
        <OrderSummary subtotal={subtotal} deliveryFee={fee} itemCount={count} title="Votre commande">
          <ul className="mb-5 space-y-2 border-b border-line pb-4 text-sm">
            {lines.map(({ product, quantity, lineTotal }) => (
              <li key={product.id} className="flex justify-between gap-3">
                <span className="text-ink">
                  {product.name} <span className="text-muted">× {quantity}</span>
                </span>
                <span className="shrink-0 font-medium text-ink">{formatPrice(lineTotal)}</span>
              </li>
            ))}
          </ul>
          <button type="submit" disabled={pending} className={buttonClasses({ size: "lg", className: "w-full" })}>
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Validation…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" aria-hidden="true" /> Valider la commande de démo
              </>
            )}
          </button>
        </OrderSummary>
        <Link href="/panier" className={buttonClasses({ variant: "ghost", className: "w-full" })}>
          Modifier le panier
        </Link>
      </div>
    </form>
  );
}
