import { z } from "zod";
import { DELIVERY_ZONES, type DeliveryZoneId } from "@/data/delivery-zones";

const ZONE_IDS = DELIVERY_ZONES.map((z) => z.id) as [DeliveryZoneId, ...DeliveryZoneId[]];

/**
 * Numéros ivoiriens à 10 chiffres (depuis 2021) : mobiles 01, 05, 07 et
 * fixes 21, 25, 27. L'indicatif +225 ou 00225 est accepté.
 */
export function normalizeIvorianPhone(input: string): string | null {
  const digits = input.replace(/[\s.\-()]/g, "");
  const match = /^(?:\+225|00225)?((?:01|05|07|21|25|27)\d{8})$/.exec(digits);
  if (!match) return null;
  const local = match[1];
  return `+225 ${local.replace(/(\d{2})(?=\d)/g, "$1 ")}`;
}

// Lettres (accentuées comprises), espaces, apostrophes, tirets et points.
const NAME_PATTERN = /^[\p{L}][\p{L}\s'’.-]*$/u;

export const checkoutFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, "Indiquez votre nom complet (3 caractères minimum).")
    .max(80, "Le nom ne doit pas dépasser 80 caractères.")
    .regex(NAME_PATTERN, "Le nom ne doit contenir que des lettres, espaces, apostrophes ou tirets."),
  phone: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const normalized = normalizeIvorianPhone(value);
      if (!normalized) {
        ctx.addIssue({
          code: "custom",
          message: "Numéro invalide. Exemple : 07 08 09 10 11 ou +225 07 08 09 10 11.",
        });
        return z.NEVER;
      }
      return normalized;
    }),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === "" || z.email().safeParse(v).success, "Adresse e-mail invalide.")
    .optional()
    .transform((v) => (v ? v : undefined)),
  zone: z.enum(ZONE_IDS, { error: "Choisissez une zone de livraison." }),
  address: z
    .string()
    .trim()
    .min(5, "Précisez l'adresse ou un point de repère (5 caractères minimum).")
    .max(200, "L'adresse ne doit pas dépasser 200 caractères."),
  note: z.string().trim().max(300, "La note ne doit pas dépasser 300 caractères.").optional(),
});

export type CheckoutFormInput = z.input<typeof checkoutFormSchema>;
export type CheckoutFormData = z.output<typeof checkoutFormSchema>;
export type CheckoutField = keyof CheckoutFormInput;

export const orderItemsSchema = z
  .array(
    z.object({
      productId: z.string().max(40),
      quantity: z.number().int().min(1).max(99),
    }),
  )
  .min(1, "Votre panier est vide.")
  .max(50);
