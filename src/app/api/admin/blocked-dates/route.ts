import { validateCsrf } from "@/lib/csrf";
import { requireAdminSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const blockedDateSchema = z.object({
  carId: z.string().min(1),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  reason: z.string().min(3).max(255),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const carId = request.nextUrl.searchParams.get("carId") ?? undefined;

    const blockedDates = await prisma.blockedDate.findMany({
      where: { ...(carId ? { carId } : {}) },
      include: { car: { select: { brand: true, model: true } } },
      orderBy: { startDate: "asc" },
    });
    return NextResponse.json({ blockedDates });
  } catch {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: "CSRF token invalide." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = blockedDateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const startDate = new Date(parsed.data.startDate);
    const endDate = new Date(parsed.data.endDate);
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "Date de fin invalide." },
        { status: 400 },
      );
    }

    const blockedDate = await prisma.blockedDate.create({
      data: {
        carId: parsed.data.carId,
        startDate,
        endDate,
        reason: parsed.data.reason,
      },
    });
    return NextResponse.json({ blockedDate }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blocage impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
