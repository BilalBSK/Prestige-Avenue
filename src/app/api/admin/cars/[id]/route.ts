import { validateCsrf } from "@/lib/csrf";
import { requireAdminSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateCarSchema = z.object({
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1990).max(2100).optional(),
  pricePerDay: z.number().positive().optional(),
  weekendPrice: z.number().positive().nullable().optional(),
  depositAmount: z.number().nonnegative().optional(),
  description: z.string().min(10).optional(),
  mainImage: z.url().optional(),
  galleryImages: z.array(z.url()).optional(),
  videoUrl: z.url().nullable().optional(),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "DISABLED"]).optional(),
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
