"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  max,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const btn =
    "flex items-center justify-center text-ink hover:bg-brand-50 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40";
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";

  return (
    <div role="group" aria-label={label} className="inline-flex items-center overflow-hidden rounded-xl border border-line bg-card">
      <button
        type="button"
        className={`${btn} ${dim}`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        aria-label="Quantité"
        className={`${size === "sm" ? "w-8 text-sm" : "w-10"} text-center font-semibold tabular-nums text-ink`}
      >
        {value}
      </output>
      <button
        type="button"
        className={`${btn} ${dim}`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
