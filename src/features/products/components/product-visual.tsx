import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { Product, ProductShape } from "@/types/product";

/**
 * Illustration vectorielle d'un produit.
 * Le catalogue étant fictif, on dessine des visuels cohérents plutôt que
 * d'utiliser des photos de marques soumises au droit d'auteur.
 */

const OUTLINE = "rgb(19 32 26 / 0.18)";

type Ids = { screen: string; glare: string };

function Screen({ x, y, w, h, r = 6, ids }: { x: number; y: number; w: number; h: number; r?: number; ids: Ids }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${ids.screen})`} />
      <path
        d={`M${x} ${y + h * 0.72} C ${x + w * 0.35} ${y + h * 0.5}, ${x + w * 0.6} ${y + h * 0.95}, ${x + w} ${y + h * 0.62} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} Z`}
        fill="#f08a1c"
        opacity="0.55"
      />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={`url(#${ids.glare})`} />
    </g>
  );
}

const shapes: Record<ProductShape, (c: string, ids: Ids) => ReactNode> = {
  phone: (c, ids) => (
    <g>
      <rect x="66" y="22" width="68" height="156" rx="14" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <Screen x={71} y={28} w={58} h={144} r={10} ids={ids} />
      <rect x="90" y="32" width="20" height="6" rx="3" fill="#0b1210" />
    </g>
  ),
  laptop: (c, ids) => (
    <g>
      <rect x="38" y="40" width="124" height="88" rx="7" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <Screen x={45} y={47} w={110} h={74} r={3} ids={ids} />
      <path d="M22 132 H178 L170 150 Q168 154 163 154 H37 Q32 154 30 150 Z" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <path d="M22 132 H178 L176 137 H24 Z" fill="#000" opacity="0.12" />
      <rect x="86" y="132" width="28" height="4" rx="2" fill="#000" opacity="0.18" />
    </g>
  ),
  headphones: (c) => (
    <g>
      <path d="M50 118 V100 A50 50 0 0 1 150 100 V118" fill="none" stroke={c} strokeWidth="11" strokeLinecap="round" />
      <path d="M50 118 V100 A50 50 0 0 1 150 100 V118" fill="none" stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="34" y="104" width="34" height="56" rx="15" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="132" y="104" width="34" height="56" rx="15" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="58" y="112" width="12" height="40" rx="6" fill="#0b1210" opacity="0.55" />
      <rect x="130" y="112" width="12" height="40" rx="6" fill="#0b1210" opacity="0.55" />
      <circle cx="51" cy="132" r="5" fill="#f08a1c" opacity="0.85" />
    </g>
  ),
  earbuds: (c) => (
    <g>
      <rect x="52" y="96" width="96" height="66" rx="30" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <path d="M54 118 H146" stroke={OUTLINE} strokeWidth="2" />
      <circle cx="100" cy="142" r="3" fill="#138a5e" />
      <g>
        <ellipse cx="78" cy="70" rx="15" ry="17" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
        <rect x="72" y="74" width="10" height="30" rx="5" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
        <ellipse cx="78" cy="66" rx="7" ry="8" fill="#0b1210" opacity="0.5" />
      </g>
      <g>
        <ellipse cx="122" cy="70" rx="15" ry="17" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
        <rect x="118" y="74" width="10" height="30" rx="5" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
        <ellipse cx="122" cy="66" rx="7" ry="8" fill="#0b1210" opacity="0.5" />
      </g>
    </g>
  ),
  charger: (c) => (
    <g>
      <rect x="80" y="148" width="9" height="26" rx="4.5" fill="#9aa3a0" />
      <rect x="111" y="148" width="9" height="26" rx="4.5" fill="#9aa3a0" />
      <rect x="60" y="56" width="80" height="96" rx="16" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="86" y="70" width="28" height="9" rx="4.5" fill="#0b1210" opacity="0.7" />
      <text x="100" y="118" textAnchor="middle" fontSize="18" fontWeight="700" fill="#0b1210" opacity="0.55" fontFamily="sans-serif">25W</text>
    </g>
  ),
  powerbank: (c) => (
    <g>
      <rect x="56" y="36" width="88" height="132" rx="18" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="62" y="42" width="76" height="120" rx="14" fill="#fff" opacity="0.08" />
      <rect x="76" y="44" width="18" height="6" rx="3" fill="#0b1210" opacity="0.6" />
      <rect x="106" y="44" width="18" height="6" rx="3" fill="#0b1210" opacity="0.6" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={85 + i * 10} cy="146" r="3" fill={i < 3 ? "#fbf8f2" : "#0b1210"} opacity={i < 3 ? 0.95 : 0.35} />
      ))}
      <path d="M104 86 L92 106 H101 L96 124 L110 100 H101 Z" fill="#fbf8f2" opacity="0.9" />
    </g>
  ),
  cable: (c) => (
    <g>
      <path d="M58 58 C 58 150, 142 50, 142 142" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round" />
      <path d="M58 58 C 58 150, 142 50, 142 142" fill="none" stroke="#fff" strokeOpacity="0.15" strokeWidth="3" strokeDasharray="4 5" />
      <rect x="47" y="26" width="22" height="36" rx="6" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="52" y="14" width="12" height="14" rx="3" fill="#b8c0bd" />
      <rect x="131" y="138" width="22" height="36" rx="6" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="136" y="172" width="12" height="14" rx="3" fill="#b8c0bd" />
    </g>
  ),
  mouse: (c, ids) => (
    <g>
      <rect x="66" y="36" width="68" height="128" rx="34" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <path d="M100 36 V92" stroke={OUTLINE} strokeWidth="2" />
      <path d="M66 92 H134" stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="95" y="52" width="10" height="22" rx="5" fill="#0b1210" opacity="0.55" />
      <rect x="66" y="36" width="68" height="128" rx="34" fill={`url(#${ids.glare})`} />
    </g>
  ),
  keyboard: (c) => (
    <g>
      <rect x="16" y="66" width="168" height="72" rx="10" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 12 }).map((_, col) => (
          <rect
            key={`${row}-${col}`}
            x={25 + col * 12.8}
            y={74 + row * 13}
            width="10"
            height="10"
            rx="2"
            fill="#fff"
            opacity="0.16"
          />
        )),
      )}
      <rect x="62" y="126" width="76" height="7" rx="2" fill="#fff" opacity="0.2" />
    </g>
  ),
  monitor: (c, ids) => (
    <g>
      <rect x="22" y="30" width="156" height="102" rx="7" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <Screen x={28} y={36} w={144} h={88} r={3} ids={ids} />
      <path d="M90 132 H110 L114 158 H86 Z" fill={c} />
      <rect x="62" y="156" width="76" height="9" rx="4.5" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
    </g>
  ),
  printer: (c) => (
    <g>
      <rect x="60" y="38" width="80" height="46" rx="3" fill="#fff" stroke={OUTLINE} strokeWidth="1.5" />
      <path d="M70 52 H128 M70 62 H118 M70 72 H124" stroke="#138a5e" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
      <rect x="30" y="78" width="140" height="66" rx="12" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="52" y="126" width="96" height="10" rx="3" fill="#0b1210" opacity="0.6" />
      <rect x="128" y="90" width="28" height="12" rx="3" fill="#0b1210" opacity="0.65" />
      <circle cx="44" cy="96" r="4" fill="#138a5e" />
      <rect x="62" y="136" width="76" height="26" rx="2" fill="#fff" stroke={OUTLINE} strokeWidth="1.5" />
    </g>
  ),
  router: (c) => (
    <g>
      {[54, 80, 120, 146].map((x) => (
        <rect key={x} x={x - 4} y="40" width="8" height="74" rx="4" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      ))}
      <rect x="32" y="104" width="136" height="46" rx="12" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={66 + i * 17} cy="127" r="3.5" fill={i === 0 ? "#f08a1c" : "#138a5e"} />
      ))}
      <path d="M100 26 a22 22 0 0 1 22 8 M100 26 a22 22 0 0 0 -22 8" fill="none" stroke="#138a5e" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </g>
  ),
  storage: (c, ids) => (
    <g>
      <rect x="62" y="40" width="76" height="120" rx="14" fill={c} stroke={OUTLINE} strokeWidth="1.5" />
      <rect x="62" y="40" width="76" height="120" rx="14" fill={`url(#${ids.glare})`} />
      <rect x="76" y="62" width="48" height="36" rx="6" fill="#fff" opacity="0.18" />
      <rect x="86" y="138" width="28" height="7" rx="3.5" fill="#0b1210" opacity="0.55" />
      <circle cx="100" cy="116" r="4" fill="#fbf8f2" opacity="0.9" />
    </g>
  ),
};

export function ProductVisual({
  product,
  className,
  size = "md",
}: {
  product: Pick<Product, "name" | "visual">;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  // Identifiants SVG uniques par produit : plusieurs visuels coexistent sur une page.
  const key = product.name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 40);
  const ids: Ids = { screen: `im-screen-${key}`, glare: `im-glare-${key}` };

  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50",
        size === "sm" ? "rounded-xl" : "rounded-2xl",
        className,
      )}
    >
      <div className="absolute -right-10 -top-10 h-1/2 w-1/2 rounded-full bg-accent-100/60 blur-2xl" aria-hidden="true" />
      <div className="absolute -bottom-12 -left-12 h-1/2 w-1/2 rounded-full bg-brand-100/70 blur-2xl" aria-hidden="true" />
      <svg
        viewBox="0 0 200 200"
        role="img"
        aria-label={`Illustration : ${product.name}`}
        className={cn(
          "relative drop-shadow-[0_12px_18px_rgb(19_32_26/0.18)]",
          size === "lg" ? "w-4/5" : "w-3/4",
        )}
      >
        <defs>
          <linearGradient id={ids.screen} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0a5d40" />
            <stop offset="1" stopColor="#063726" />
          </linearGradient>
          <linearGradient id={ids.glare} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {shapes[product.visual.shape](product.visual.color, ids)}
      </svg>
    </div>
  );
}
