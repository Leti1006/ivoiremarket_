import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap";

const variants: Record<Variant, string> = {
  primary: "bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-900",
  accent: "bg-accent-500 text-ink hover:bg-accent-600 hover:text-white",
  outline: "border border-line bg-card text-ink hover:border-brand-600 hover:text-brand-700",
  ghost: "text-ink hover:bg-brand-50 hover:text-brand-700",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

/** Classes de bouton réutilisables sur <button> comme sur <Link>. */
export function buttonClasses(
  options: { variant?: Variant; size?: Size; className?: string } = {},
): string {
  const { variant = "primary", size = "md", className } = options;
  return cn(base, variants[variant], sizes[size], className);
}
