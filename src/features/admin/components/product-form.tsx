"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { categories } from "@/data/categories";
import type { ProductImage } from "@/data/product-images";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";
import { saveProductAction, type ProductFormState } from "../actions";
import type { ProductFormField } from "../product-schema";

const inputClass = (invalid: boolean) =>
  cn(
    "w-full rounded-xl border bg-card px-3 text-sm text-ink",
    invalid ? "border-danger" : "border-line focus:border-brand-600",
  );

function Field({
  name,
  label,
  error,
  hint,
  children,
}: {
  name: ProductFormField;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={`f-${name}`} className="text-sm font-semibold text-ink">{label}</label>
      {children}
      {error ? (
        <p id={`f-${name}-error`} className="flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted">{hint}</p>
      )}
    </div>
  );
}

export function ProductForm({ product, images }: { product?: Product; images: ProductImage[] }) {
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(saveProductAction, {});
  const [imageKey, setImageKey] = useState(product?.image ?? "");
  const preview = images.find((i) => i.key === imageKey);
  const errors = state.fieldErrors ?? {};
  // Après une erreur, on réaffiche ce qui a été saisi plutôt que les valeurs initiales.
  const v = state.values;

  const a11y = (name: ProductFormField) => ({
    id: `f-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `f-${name}-error` : undefined,
  });

  return (
    <form action={formAction} className="grid items-start gap-6 xl:grid-cols-[1fr_20rem]">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-5 rounded-2xl border border-line bg-card p-5 shadow-card sm:p-6">
        {state.error && (
          <p role="alert" className="flex gap-2 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {state.error}
          </p>
        )}

        <Field name="name" label="Nom du produit" error={errors.name}>
          <input {...a11y("name")} defaultValue={v?.name ?? product?.name} maxLength={120} className={cn(inputClass(!!errors.name), "h-11")} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field name="brand" label="Marque" error={errors.brand}>
            <input {...a11y("brand")} defaultValue={v?.brand ?? product?.brand} maxLength={40} className={cn(inputClass(!!errors.brand), "h-11")} />
          </Field>
          <Field name="category" label="Catégorie" error={errors.category}>
            <select {...a11y("category")} defaultValue={v?.category ?? product?.category ?? "smartphones"} className={cn(inputClass(!!errors.category), "h-11")}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field name="price" label="Prix (FCFA)" error={errors.price}>
            <input {...a11y("price")} inputMode="numeric" defaultValue={v?.price ?? product?.price} className={cn(inputClass(!!errors.price), "h-11")} />
          </Field>
          <Field name="oldPrice" label="Ancien prix (promo)" error={errors.oldPrice} hint="Vide = pas de promotion.">
            <input {...a11y("oldPrice")} inputMode="numeric" defaultValue={v?.oldPrice ?? product?.oldPrice ?? ""} className={cn(inputClass(!!errors.oldPrice), "h-11")} />
          </Field>
          <Field name="stock" label="Stock" error={errors.stock}>
            <input {...a11y("stock")} inputMode="numeric" defaultValue={v?.stock ?? product?.stock ?? 0} className={cn(inputClass(!!errors.stock), "h-11")} />
          </Field>
        </div>

        <Field name="description" label="Description" error={errors.description}>
          <textarea {...a11y("description")} rows={4} maxLength={1000} defaultValue={v?.description ?? product?.description} className={cn(inputClass(!!errors.description), "py-2.5")} />
        </Field>

        <Field name="highlights" label="Points clés" error={errors.highlights} hint="Un point par ligne (8 au maximum).">
          <textarea {...a11y("highlights")} rows={4} defaultValue={v?.highlights ?? product?.highlights.join("\n")} className={cn(inputClass(!!errors.highlights), "py-2.5")} />
        </Field>

        <Field name="slug" label="Adresse de la page (slug)" error={errors.slug} hint="Laissez vide pour la générer à partir du nom.">
          <div className="flex items-center rounded-xl border border-line bg-surface pl-3 text-sm text-muted">
            <span className="shrink-0">/produits/</span>
            <input {...a11y("slug")} defaultValue={v?.slug ?? product?.slug} maxLength={80} className="h-11 min-w-0 flex-1 rounded-r-xl border-0 bg-card px-2 text-ink" />
          </div>
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink">
          <input type="checkbox" name="featured" defaultChecked={v ? v.featured : product?.featured} className="h-4 w-4 accent-brand-700" />
          Mettre en avant sur la page d&apos;accueil
        </label>
      </div>

      <div className="space-y-4 xl:sticky xl:top-6">
        <div className="space-y-3 rounded-2xl border border-line bg-card p-5 shadow-card">
          <Field name="image" label="Photo" error={errors.image} hint="Photos sous licence libre de la photothèque.">
            <select {...a11y("image")} value={imageKey} onChange={(e) => setImageKey(e.target.value)} className={cn(inputClass(!!errors.image), "h-11")}>
              <option value="">Aucune (illustration)</option>
              {images.map((img) => (
                <option key={img.key} value={img.key}>{img.key}</option>
              ))}
            </select>
          </Field>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f3f1ec]">
            {preview ? (
              <Image src={preview.thumb} alt="Aperçu de la photo" fill sizes="320px" className="object-contain p-3 mix-blend-multiply" />
            ) : (
              <p className="flex h-full items-center justify-center p-6 text-center text-sm text-muted">
                Sans photo, une illustration de la catégorie est affichée.
              </p>
            )}
          </div>
          {preview && <p className="text-xs text-muted">© {preview.author} — {preview.license}</p>}
        </div>

        <button type="submit" disabled={pending} className={buttonClasses({ size: "lg", className: "w-full" })}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
          {product ? "Enregistrer les modifications" : "Créer le produit"}
        </button>
        <Link href="/admin/produits" className={buttonClasses({ variant: "ghost", className: "w-full" })}>Annuler</Link>
      </div>
    </form>
  );
}
