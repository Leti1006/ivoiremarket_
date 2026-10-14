import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getAdminConfig, SESSION_COOKIE, verifySessionToken } from "./auth";

/** Vrai si la requête courante porte une session administrateur valide. */
export async function isAdmin(): Promise<boolean> {
  // La vérification dépend de l'heure (expiration) : elle doit se faire à
  // chaque requête, jamais pendant un pré-rendu.
  await connection();
  const config = getAdminConfig();
  if (!config) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(config.secret, token);
}

/**
 * À appeler au début de CHAQUE page et action d'administration.
 * Le Proxy filtre déjà les visiteurs non connectés, mais la vérification
 * qui fait foi est celle-ci, au plus près des données.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/connexion");
}
