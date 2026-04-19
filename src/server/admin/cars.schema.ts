import { CarCategory, CarStatus, FuelType, Transmission } from "@prisma/client";
import { z } from "zod";

export const featureSchema = z.object({
  title: z.string().min(3).max(60),
  body: z.string().min(10).max(300),
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
  weekendPackagePrice: z.number().positive().max(100000).nullable(),
  weekendPackageIncludedKm: z.number().int().positive().max(10000).nullable(),
  depositAmount: z.number().positive().max(1000000),

  minDriverAge: z.number().int().min(18).max(99),
  minLicenseYears: z.number().int().min(0).max(50),

  description: z.string().min(50).max(2000),
  highlights: z.array(z.string().min(3).max(80)).max(8),
  features: z.array(featureSchema).max(10),

  mainImage: z.url(),
  galleryImages: z.array(z.url()).max(12),
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
});

export type UploadTokenInput = z.infer<typeof uploadTokenInputSchema>;
