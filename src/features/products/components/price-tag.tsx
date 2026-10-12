import { discountPercent, formatPrice } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PriceTag({
  price,
  oldPrice,
  size = "md",
}: {
  price: number;
  oldPrice?: number;
  size?: "md" | "lg";
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={cn("font-extrabold text-ink", size === "lg" ? "text-3xl" : "text-lg")}>
        {formatPrice(price)}
      </span>
      {oldPrice !== undefined && oldPrice > price && (
        <>
          <span className={cn("text-muted line-through", size === "lg" ? "text-base" : "text-sm")}>
            <span className="sr-only">Prix précédent : </span>
            {formatPrice(oldPrice)}
          </span>
          <span className="rounded-md bg-accent-100 px-1.5 py-0.5 text-xs font-bold text-accent-700">
            −{discountPercent(price, oldPrice)} %
          </span>
        </>
      )}
    </div>
  );
}
