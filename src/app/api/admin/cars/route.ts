import { validateCsrf } from "@/lib/csrf";
import { requireAdminSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const carSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(2100),
  pricePerDay: z.number().positive(),
  weekendPrice: z.number().positive().nullable(),
  depositAmount: z.number().nonnegative(),
  description: z.string().min(10),
  mainImage: z.url(),
  galleryImages: z.array(z.url()).default([]),
  videoUrl: z.url().nullable(),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "DISABLED"]).default("AVAILABLE"),
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
      data: parsed.data,
    });
    return NextResponse.json({ car }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Creation impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
