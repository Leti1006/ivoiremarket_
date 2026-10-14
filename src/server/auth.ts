import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Authentification de l'administrateur (un seul compte).
 *
 * - Les identifiants viennent des variables d'environnement ADMIN_USERNAME,
 *   ADMIN_PASSWORD et SESSION_SECRET : rien n'est écrit dans le code, le
 *   dépôt Git ou l'image Docker.
 * - La session est un jeton « expiration.nonce.signature » signé en
 *   HMAC-SHA256, stocké dans un cookie httpOnly (illisible en JavaScript).
 * - Les comparaisons se font à temps constant (pas de fuite par le timing).
 */

export const SESSION_COOKIE = "im_admin";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 heures

export type AdminConfig = { username: string; password: string; secret: string };

/** Retourne null si l'administration n'est pas (correctement) configurée. */
export function getAdminConfig(): AdminConfig | null {
  const password = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.SESSION_SECRET ?? "";
  if (password.length < 10 || secret.length < 32) return null;
  return { username: process.env.ADMIN_USERNAME || "admin", password, secret };
}

function safeEqual(a: string, b: string): boolean {
  // On compare des empreintes de taille fixe pour ne pas révéler la longueur.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function verifyCredentials(config: AdminConfig, username: string, password: string): boolean {
  // Les deux comparaisons sont toujours effectuées (temps constant).
  const userOk = safeEqual(username, config.username);
  const passOk = safeEqual(password, config.password);
  return userOk && passOk;
}

function sign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(secret: string, now = Date.now()): string {
  const expires = Math.floor(now / 1000) + SESSION_DURATION_SECONDS;
  const payload = `${expires}.${randomBytes(12).toString("base64url")}`;
  return `${payload}.${sign(secret, payload)}`;
}

export function verifySessionToken(secret: string, token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expires, nonce, signature] = parts;
  const expected = sign(secret, `${expires}.${nonce}`);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Number(expires) * 1000 > now;
}

/* ----------------------------------------------------------------------------
 * Limitation des tentatives de connexion (en mémoire, par adresse IP) :
 * au-delà de 5 échecs en 15 minutes, l'adresse est bloquée temporairement.
 * -------------------------------------------------------------------------- */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map<string, { count: number; first: number }>();

export function isRateLimited(ip: string, now = Date.now()): boolean {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (now - entry.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return entry.count >= MAX_FAILURES;
}

export function recordFailure(ip: string, now = Date.now()): void {
  const entry = failures.get(ip);
  if (!entry || now - entry.first > WINDOW_MS) failures.set(ip, { count: 1, first: now });
  else entry.count += 1;
}

export function clearFailures(ip: string): void {
  failures.delete(ip);
}
