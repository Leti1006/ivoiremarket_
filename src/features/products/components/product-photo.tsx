import Image from "next/image";
import { getProductImage } from "@/data/product-images";
import { cn } from "@/lib/cn";
import type { CategoryId } from "@/types/product";
import { ProductVisual } from "./product-visual";

type Props = {
  product: { name: string; category: CategoryId; image?: string };
  /** Indication de largeur d'affichage (attribut sizes). */
  sizes: string;
  /** « full » (1200 px) pour une grande image, sinon miniature 600 px. */
  variant?: "thumb" | "full";
  className?: string;
  /** À activer pour l'image principale visible dès l'arrivée sur la page. */
  preload?: boolean;
  rounded?: "xl" | "2xl";
};

/**
 * Photo réelle du produit, pré-optimisée en WebP (600 ou 1200 px), avec
 * chargement différé géré par next/image. À défaut de photo, une
 * illustration vectorielle est affichée.
 */
export function ProductPhoto({ product, sizes, className, preload, rounded = "2xl", variant = "thumb" }: Props) {
  const image = getProductImage(product.image);
  const radius = rounded === "xl" ? "rounded-xl" : "rounded-2xl";

  if (!image) {
    return <ProductVisual product={product} className={cn(radius, className)} size={rounded === "xl" ? "sm" : "md"} />;
  }

  return (
    <div className={cn("relative aspect-square overflow-hidden bg-[#f3f1ec]", radius, className)}>
      <Image
        src={variant === "full" ? image.file : image.thumb}
        alt={product.name}
        fill
        sizes={sizes}
        preload={preload}
        className="object-contain p-[6%] mix-blend-multiply"
      />
    </div>
  );
}

export function PhotoCredit({ imageKey }: { imageKey?: string }) {
  const image = getProductImage(imageKey);
  if (!image) return <p className="text-xs text-muted">Illustration non contractuelle.</p>;
  return (
    <p className="text-xs leading-relaxed text-muted">
      Photo :{" "}
      <a href={image.source} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
        {image.author}
      </a>
      , licence{" "}
      {image.licenseUrl ? (
        <a href={image.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline-offset-2 hover:underline">
          {image.license}
        </a>
      ) : (
        image.license
      )}
      , via Wikimedia Commons. Photo d&apos;illustration du modèle, non contractuelle.
    </p>
  );
}
