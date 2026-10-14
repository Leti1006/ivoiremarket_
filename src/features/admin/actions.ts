"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  clearFailures,
  createSessionToken,
  getAdminConfig,
  isRateLimited,
  recordFailure,
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  verifyCredentials,
} from "@/server/auth";
import { changeOrderStatus, ORDER_STATUSES } from "@/server/orders-repo";
import { createProduct, deleteProduct, slugExists, updateProduct } from "@/server/products-repo";
import { requireAdmin } from "@/server/session";
import { productFormSchema, readProductForm, type ProductFormField } from "./product-schema";

/* ------------------------------------------------------------------------- */
/* Connexion / déconnexion                                                   */
/* ------------------------------------------------------------------------- */

export type LoginState = { error?: string };

// Pas d'adresse IP fiable sans proxy inverse : la limite s'applique globalement.
const RATE_LIMIT_KEY = "admin-login";

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const config = getAdminConfig();
  if (!config) {
    return { error: "L'administration n'est pas configurée sur ce serveur (variables ADMIN_PASSWORD et SESSION_SECRET)." };
  }
  if (isRateLimited(RATE_LIMIT_KEY)) {
    return { error: "Trop de tentatives échouées. Réessayez dans 15 minutes." };
  }

  const username = String(formData.get("username") ?? "").slice(0, 100);
  const password = String(formData.get("password") ?? "").slice(0, 200);

  if (!verifyCredentials(config, username, password)) {
    recordFailure(RATE_LIMIT_KEY);
    return { error: "Identifiant ou mot de passe incorrect." };
  }

  clearFailures(RATE_LIMIT_KEY);
  (await cookies()).set(SESSION_COOKIE, createSessionToken(config.secret), {
    httpOnly: true,
    sameSite: "strict",
    // HTTPS uniquement si le site est servi en HTTPS (COOKIE_SECURE=true).
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/connexion");
}

/* ------------------------------------------------------------------------- */
/* Produits                                                                  */
/* ------------------------------------------------------------------------- */

export type ProductFormState = {
  error?: string;
  fieldErrors?: Partial<Record<ProductFormField, string>>;
  /** Valeurs saisies, renvoyées pour ne pas vider le formulaire en cas d'erreur. */
  values?: ReturnType<typeof readProductForm>;
};

/** Création (id absent) ou modification (id présent) d'un produit. */
export async function saveProductAction(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "") || undefined;
  const values = readProductForm(formData);
  const parsed = productFormSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: ProductFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ProductFormField | undefined;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { error: "Certains champs sont invalides.", fieldErrors, values };
  }

  const data = parsed.data;
  if (slugExists(data.slug, id)) {
    return { fieldErrors: { slug: "Cette adresse est déjà utilisée par un autre produit." }, values };
  }

  if (id) {
    if (!updateProduct(id, data)) return { error: "Produit introuvable (il a peut-être été supprimé).", values };
  } else {
    createProduct(data);
  }

  // Les pages de la boutique et de l'administration affichent les nouvelles valeurs.
  revalidatePath("/", "layout");
  redirect(`/admin/produits?ok=${id ? "modifie" : "cree"}`);
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.string().min(1).max(40).safeParse(formData.get("id"));
  if (id.success) deleteProduct(id.data);
  revalidatePath("/", "layout");
  redirect("/admin/produits?ok=supprime");
}

/* ------------------------------------------------------------------------- */
/* Commandes                                                                 */
/* ------------------------------------------------------------------------- */

export type StatusFormState = { error?: string; success?: string };

export async function changeOrderStatusAction(_prev: StatusFormState, formData: FormData): Promise<StatusFormState> {
  await requireAdmin();
  const parsed = z
    .object({ id: z.coerce.number().int().positive(), status: z.enum(ORDER_STATUSES) })
    .safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return { error: "Requête invalide." };

  const result = changeOrderStatus(parsed.data.id, parsed.data.status);
  if (!result.ok) return { error: result.error };

  revalidatePath("/", "layout");
  return { success: "Statut mis à jour." };
}
