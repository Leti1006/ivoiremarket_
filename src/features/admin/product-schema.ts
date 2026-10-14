import { z } from "zod";
import { isKnownImage } from "@/data/product-images";
import { CATEGORY_IDS } from "@/types/product";

/** "Écouteurs Sony 2" -> "ecouteurs-sony-2" */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const intField = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} : champ obligatoire.`)
    .transform((v) => Number(v.replace(/\s/g, "")))
    .pipe(
      z
        .number({ error: `${label} : nombre invalide.` })
        .int(`${label} : nombre entier attendu.`)
        .min(min, `${label} : minimum ${min}.`)
        .max(max, `${label} : maximum ${max}.`),
    );

/** Validation du formulaire produit de l'administration (données issues d'un FormData). */
export const productFormSchema = z
  .object({
    name: z.string().trim().min(3, "Nom : 3 caractères minimum.").max(120, "Nom : 120 caractères maximum."),
    slug: z
      .string()
      .trim()
      .max(80, "Adresse : 80 caractères maximum.")
      .refine((v) => v === "" || SLUG_PATTERN.test(v), "Adresse : lettres minuscules, chiffres et tirets uniquement."),
    brand: z.string().trim().min(1, "Marque : champ obligatoire.").max(40, "Marque : 40 caractères maximum."),
    category: z.enum(CATEGORY_IDS, { error: "Catégorie invalide." }),
    price: intField("Prix", 100, 50_000_000),
    oldPrice: z
      .string()
      .trim()
      .transform((v) => (v === "" ? undefined : Number(v.replace(/\s/g, ""))))
      .pipe(z.number({ error: "Ancien prix : nombre invalide." }).int().positive().optional()),
    stock: intField("Stock", 0, 100_000),
    description: z
      .string()
      .trim()
      .min(10, "Description : 10 caractères minimum.")
      .max(1000, "Description : 1000 caractères maximum."),
    highlights: z
      .string()
      .transform((v) => v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))
      .pipe(
        z
          .array(z.string().max(80, "Point clé : 80 caractères maximum par ligne."))
          .max(8, "Points clés : 8 lignes maximum."),
      ),
    featured: z.boolean(),
    image: z.string().refine((v) => v === "" || isKnownImage(v), "Photo inconnue."),
  })
  .refine((d) => d.oldPrice === undefined || d.oldPrice > d.price, {
    path: ["oldPrice"],
    message: "Ancien prix : il doit être supérieur au prix actuel (sinon laissez vide).",
  })
  .transform((d) => ({
    ...d,
    slug: d.slug || slugify(d.name),
    image: d.image || undefined,
  }));

export type ProductFormField =
  | "name" | "slug" | "brand" | "category" | "price" | "oldPrice" | "stock"
  | "description" | "highlights" | "featured" | "image";

export function readProductForm(formData: FormData) {
  const text = (key: string) => {
    const v = formData.get(key);
    return typeof v === "string" ? v : "";
  };
  return {
    name: text("name"),
    slug: text("slug"),
    brand: text("brand"),
    category: text("category"),
    price: text("price"),
    oldPrice: text("oldPrice"),
    stock: text("stock"),
    description: text("description"),
    highlights: text("highlights"),
    featured: formData.get("featured") === "on",
    image: text("image"),
  };
}
