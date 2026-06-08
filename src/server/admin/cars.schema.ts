import { CarCategory, CarStatus, FuelType, Transmission } from "@prisma/client";
import { z } from "zod";
import { SHOT_ANGLES, type ShotAngle } from "@/lib/cars/shots";

export const featureSchema = z.object({
  title: z.string().min(3).max(60),
  body: z.string().min(10).max(300),
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

  minDriverAge: z.number().int().min(18).max(99),
  minLicenseYears: z.number().int().min(0).max(50),

  description: z.string().min(50).max(2000),
  highlights: z.array(z.string().min(3).max(80)).max(8),
  features: z.array(featureSchema).max(10),

  mainImage: z.url(),
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
  // rétrocompatible ; "collaborations" pour les photos de partenaires.
  scope: z.enum(["cars", "collaborations"]).default("cars"),
  // Nature du média : conditionne les MIME/taille autorisés et la durée de
  // l'URL signée. Par défaut "image" (rétrocompatible).
  kind: z.enum(["image", "video"]).default("image"),
});

export type UploadTokenInput = z.infer<typeof uploadTokenInputSchema>;
