import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { STATUS_LABELS, type OrderStatus } from "../order-status";

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const STATUS_TONES: Record<OrderStatus, string> = {
  nouvelle: "bg-accent-100 text-accent-700",
  confirmee: "bg-sky-100 text-sky-800",
  expediee: "bg-indigo-100 text-indigo-800",
  livree: "bg-brand-100 text-brand-800",
  annulee: "bg-danger-50 text-danger",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", STATUS_TONES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-line bg-card p-5 shadow-card", className)}>{children}</div>;
}

export function Notice({ tone = "success", children }: { tone?: "success" | "error"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mb-5 rounded-xl px-4 py-3 text-sm font-medium",
        tone === "success" ? "bg-brand-50 text-brand-800" : "bg-danger-50 text-danger",
      )}
    >
      {children}
    </p>
  );
}

export function AdminSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Chargement">
      <div className="h-9 w-64 animate-pulse rounded-lg bg-line/60" />
      <div className="h-64 animate-pulse rounded-2xl bg-line/60" />
    </div>
  );
}

/** Date ISO -> « 12/10/2026 à 17:36 » (fuseau d'Abidjan, UTC+0). */
export function formatDateTime(iso: string): string {
  const d = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} à ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
