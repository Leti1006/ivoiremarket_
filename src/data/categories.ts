import type { Category, CategoryId } from "@/types/product";

export const categories: Category[] = [
  {
    id: "smartphones",
    name: "Smartphones",
    description: "Android et iPhone, de l'entrée de gamme au haut de gamme.",
  },
  {
    id: "ordinateurs",
    name: "Ordinateurs portables",
    description: "Pour les études, le bureau et la création.",
  },
  {
    id: "ecouteurs",
    name: "Écouteurs & casques",
    description: "Sans fil, à réduction de bruit ou pour le sport.",
  },
  {
    id: "accessoires",
    name: "Accessoires",
    description: "Chargeurs, batteries externes, câbles et stockage.",
  },
  {
    id: "peripheriques",
    name: "Périphériques",
    description: "Souris, claviers, écrans et imprimantes.",
  },
  {
    id: "reseau",
    name: "Équipements réseau",
    description: "Routeurs Wi-Fi, 4G et répéteurs pour rester connecté.",
  },
];

export function getCategory(id: CategoryId): Category {
  const category = categories.find((c) => c.id === id);
  if (!category) throw new Error(`Catégorie inconnue : ${id}`);
  return category;
}
