import { validateCsrf } from "@/lib/csrf";
import { requireAdminSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const featureSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

const carSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  brand: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().nullable().optional(),
  year: z.number().int().min(1990).max(2100),
  category: z.enum([
    "CITADINE",
    "COMPACTE",
    "BERLINE",
    "SUV",
    "COUPE",
    "CABRIOLET",
    "SPORTIVE",
  ]),
  power: z.number().int().positive(),
  transmission: z.enum(["MANUAL", "AUTOMATIC"]),
  fuelType: z.enum(["PETROL", "DIESEL", "HYBRID", "PLUG_IN_HYBRID", "ELECTRIC"]),
  seats: z.number().int().min(1).max(9).default(5),
  doors: z.number().int().min(2).max(5).default(5),
  pricePerDay: z.number().positive(),
  pricePerKm: z.number().nonnegative().nullable().optional(),
  includedKmPerDay: z.number().int().nonnegative().nullable().optional(),
  weekendPackagePrice: z.number().positive().nullable().optional(),
  weekendPackageIncludedKm: z.number().int().nonnegative().nullable().optional(),
  depositAmount: z.number().nonnegative(),
  minDriverAge: z.number().int().min(18).max(99).default(21),
  minLicenseYears: z.number().int().min(0).max(50).default(2),
  shortTagline: z.string().max(280).nullable().optional(),
  description: z.string().min(10),
  highlights: z.array(z.string().min(1)).default([]),
  features: z.array(featureSchema).default([]),
  mainImage: z.url(),
  galleryImages: z.array(z.url()).default([]),
  videoUrl: z.url().nullable().optional(),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "DISABLED"]).default("AVAILABLE"),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().nonnegative().default(0),
});

export async function GET() {
  try {
    await requireAdminSession();
    const cars = await prisma.car.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ cars });
  } catch {
    return NextResponse.json({ error: "Acces refuse." }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: "CSRF token invalide." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = carSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const car = await prisma.car.create({
      data: {
        ...parsed.data,
        features: parsed.data.features,
      },
    });
    return NextResponse.json({ car }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Creation impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
