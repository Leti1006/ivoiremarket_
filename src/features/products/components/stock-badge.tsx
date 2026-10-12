import { cn } from "@/lib/cn";

export function stockLabel(stock: number): string {
  if (stock <= 0) return "Rupture de stock";
  if (stock <= 5) return `Plus que ${stock} en stock`;
  return "En stock";
}

export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  const tone =
    stock <= 0
      ? "bg-danger-50 text-danger"
      : stock <= 5
        ? "bg-accent-50 text-accent-700"
        : "bg-brand-50 text-brand-700";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone,
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          stock <= 0 ? "bg-danger" : stock <= 5 ? "bg-accent-500" : "bg-brand-500",
        )}
        aria-hidden="true"
      />
      {stockLabel(stock)}
    </span>
  );
}
