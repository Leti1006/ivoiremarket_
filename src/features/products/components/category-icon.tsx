import { Cable, Headphones, Laptop, Mouse, Router, Smartphone, type LucideIcon } from "lucide-react";
import type { CategoryId } from "@/types/product";

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  smartphones: Smartphone,
  ordinateurs: Laptop,
  ecouteurs: Headphones,
  accessoires: Cable,
  peripheriques: Mouse,
  reseau: Router,
};
