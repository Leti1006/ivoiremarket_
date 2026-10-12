import Link from "next/link";
import { cn } from "@/lib/cn";

/** Logo IvoireMarket : un sac stylisé avec une puce « signal » orange. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={cn("h-9 w-9", className)}>
      <rect width="40" height="40" rx="11" fill="#0a5d40" />
      <path
        d="M13 16h14l-1.3 13.2a2 2 0 0 1-2 1.8h-7.4a2 2 0 0 1-2-1.8L13 16Z"
        fill="#fbf8f2"
      />
      <path
        d="M16.5 16v-1.5a3.5 3.5 0 0 1 7 0V16"
        fill="none"
        stroke="#fbf8f2"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="28.5" cy="11.5" r="3.5" fill="#f08a1c" />
      <path d="M17.5 22.5h5" stroke="#0a5d40" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-2.5", className)}
      aria-label="IvoireMarket, retour à l'accueil"
    >
      <LogoMark />
      <span className="text-xl font-extrabold tracking-tight text-ink">
        Ivoire<span className="text-brand-700">Market</span>
      </span>
    </Link>
  );
}
