import { validateCsrf } from "@/lib/csrf";
import { requireAdminSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const featureSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

const updateCarSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  trim: z.string().nullable().optional(),
  year: z.number().int().min(1990).max(2100).optional(),
  category: z
    .enum(["CITADINE", "COMPACTE", "BERLINE", "SUV", "COUPE", "CABRIOLET", "SPORTIVE"])
    .optional(),
  power: z.number().int().positive().optional(),
  transmission: z.enum(["MANUAL", "AUTOMATIC"]).optional(),
  fuelType: z
    .enum(["PETROL", "DIESEL", "HYBRID", "PLUG_IN_HYBRID", "ELECTRIC"])
    .optional(),
  seats: z.number().int().min(1).max(9).optional(),
  doors: z.number().int().min(2).max(5).optional(),
  pricePerDay: z.number().positive().optional(),
  pricePerKm: z.number().nonnegative().nullable().optional(),
  includedKmPerDay: z.number().int().nonnegative().nullable().optional(),
  weekendPackagePrice: z.number().positive().nullable().optional(),
  weekendPackageIncludedKm: z.number().int().nonnegative().nullable().optional(),
  depositAmount: z.number().nonnegative().optional(),
  minDriverAge: z.number().int().min(18).max(99).optional(),
  minLicenseYears: z.number().int().min(0).max(50).optional(),
  shortTagline: z.string().max(280).nullable().optional(),
  description: z.string().min(10).optional(),
  highlights: z.array(z.string().min(1)).optional(),
  features: z.array(featureSchema).optional(),
  mainImage: z.url().optional(),
  galleryImages: z.array(z.url()).optional(),
  videoUrl: z.url().nullable().optional(),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "DISABLED"]).optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: "CSRF token invalide." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateCarSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { id } = await params;
    const car = await prisma.car.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ car });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mise a jour impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await requireAdminSession();
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: "CSRF token invalide." }, { status: 403 });
    }

    const { id } = await params;
    await prisma.car.update({
      where: { id },
      data: { status: "DISABLED" },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Suppression impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
