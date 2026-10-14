import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { LoginForm } from "@/features/admin/components/login-form";
import { getAdminConfig } from "@/server/auth";
import { isAdmin } from "@/server/session";

export const metadata: Metadata = { title: "Connexion administrateur", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main id="contenu" className="flex flex-1 items-center justify-center bg-brand-900 px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-surface p-7 shadow-lift">
        <Logo />
        <h1 className="mt-6 flex items-center gap-2 text-xl font-extrabold text-ink">
          <ShieldCheck className="h-5 w-5 text-brand-700" aria-hidden="true" />
          Espace administrateur
        </h1>
        <p className="mt-1 text-sm text-muted">Gestion du catalogue, des stocks et des commandes.</p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-line/60" />}>
            <LoginGate />
          </Suspense>
        </div>
        <Link href="/" className="mt-6 block text-center text-sm text-muted hover:text-brand-700">
          ← Retour à la boutique
        </Link>
      </div>
    </main>
  );
}

/** Lit le cookie de session : un administrateur déjà connecté va directement au tableau de bord. */
async function LoginGate() {
  if (await isAdmin()) redirect("/admin");
  if (!getAdminConfig()) {
    return (
      <p role="alert" className="rounded-xl bg-accent-50 px-4 py-3 text-sm text-accent-700">
        L&apos;administration est désactivée : définissez les variables d&apos;environnement
        <code className="mx-1 font-mono">ADMIN_PASSWORD</code> (10 caractères minimum) et
        <code className="mx-1 font-mono">SESSION_SECRET</code> (32 caractères minimum) au démarrage du serveur.
      </p>
    );
  }
  return <LoginForm />;
}
