import { CarCategory, CarStatus, FuelType, Transmission } from "@prisma/client";
import { z } from "zod";
import { SHOT_ANGLES, type ShotAngle } from "@/lib/cars/shots";
import {
  MAX_RENTAL_CONDITIONS,
  RENTAL_CONDITION_HINT_MAX,
  RENTAL_CONDITION_LABEL_MAX,
  RENTAL_CONDITION_VALUE_MAX,
} from "@/lib/cars/conditions";

export const featureSchema = z.object({
  title: z.string().min(3).max(60),
  body: z.string().min(10).max(300),
  // Image illustrant ce paragraphe sur la fiche (section « Sous le capot »).
  // Optionnelle : à défaut, la fiche réutilise automatiquement une prise de vue
  // du studio. `nullish` pour rester compatible avec les véhicules existants
  // (équipements stockés sans champ image).
  image: z.url().nullish(),
});

/** Une condition de location : intitulé + valeur mise en avant + note optionnelle. */
export const rentalConditionSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "Intitulé requis")
    .max(RENTAL_CONDITION_LABEL_MAX, `${RENTAL_CONDITION_LABEL_MAX} caractères max.`),
  value: z
    .string()
    .trim()
    .min(1, "Valeur requise")
    .max(RENTAL_CONDITION_VALUE_MAX, `${RENTAL_CONDITION_VALUE_MAX} caractères max.`),
  hint: z
    .string()
    .trim()
    .max(RENTAL_CONDITION_HINT_MAX, `${RENTAL_CONDITION_HINT_MAX} caractères max.`)
    .nullish(),
});

const SHOT_ANGLE_VALUES = SHOT_ANGLES.map((d) => d.angle) as [
  ShotAngle,
  ...ShotAngle[],
];

/** Une prise de vue : un angle canonique + 0..8 photos. */
export const shotSchema = z.object({
  angle: z.enum(SHOT_ANGLE_VALUES),
  images: z.array(z.url()).max(8),
});

export const carFormSchema = z.object({
  brand: z.string().min(2).max(50),
  model: z.string().min(1).max(50),
  trim: z.string().max(60).nullable(),
  year: z.number().int().min(1990).max(2030),
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug invalide (lettres minuscules, chiffres, tirets)"),
  category: z.enum(CarCategory),
  shortTagline: z.string().max(150).nullable(),

  power: z.number().int().min(40).max(1500),
  transmission: z.enum(Transmission),
  fuelType: z.enum(FuelType),
  seats: z.number().int().min(2).max(9),
  doors: z.number().int().min(2).max(5),

  pricePerDay: z.number().positive().max(100000),
  pricePerKm: z.number().positive().max(100).nullable(),
  includedKmPerDay: z.number().int().positive().max(10000).nullable(),
  weekendPackagePrice48h: z.number().positive().max(100000).nullable(),
  weekendPackageIncludedKm48h: z.number().int().positive().max(10000).nullable(),
  weekendPackagePrice72h: z.number().positive().max(100000).nullable(),
  weekendPackageIncludedKm72h: z.number().int().positive().max(10000).nullable(),
  depositAmount: z.number().positive().max(1000000),

  rentalConditions: z.array(rentalConditionSchema).max(MAX_RENTAL_CONDITIONS),

  description: z.string().min(50).max(2000),
  highlights: z.array(z.string().min(3).max(80)).max(8),
  features: z.array(featureSchema).max(10),

  mainImage: z.url(),
  // Image d'illustration de la section « Sélection ». Optionnelle : repli côté
  // public sur une vue intérieure puis sur mainImage.
  highlightImage: z.url().nullable(),
  galleryImages: z.array(z.url()).max(12),
  // Prises de vue cataloguées par angle. Un angle peut n'avoir aucune photo
  // (il sera simplement masqué côté public) ; on plafonne le total.
  galleryShots: z.array(shotSchema).max(SHOT_ANGLES.length),
  videoUrl: z.url().nullable(),

  status: z.enum(CarStatus),
  isFeatured: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

export type CarInput = z.infer<typeof carFormSchema>;

export const uploadTokenInputSchema = z.object({
  filename: z.string().min(1).max(200),
  mime: z.string().min(1),
  size: z.number().int().positive(),
  folder: z.string().min(1).max(80),
  // Préfixe de plus haut niveau dans le bucket. Par défaut "cars" pour rester
  // rétrocompatible ; "collaborations" pour les photos de partenaires ;
  // "home" pour les médias de la galerie d'accueil.
  scope: z.enum(["cars", "collaborations", "home"]).default("cars"),
  // Nature du média : conditionne les MIME/taille autorisés et la durée de
  // l'URL signée. Par défaut "image" (rétrocompatible).
  kind: z.enum(["image", "video"]).default("image"),
});

export type UploadTokenInput = z.infer<typeof uploadTokenInputSchema>;
