import { validateCsrf } from "@/lib/csrf";
import { requireAdminSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { createManualBooking } from "@/services/booking.service";
import { BookingSource, BookingStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const dateInput = z.union([z.iso.datetime(), z.iso.date()]);

const manualBookingSchema = z
  .object({
    carId: z.string().min(1),
    customerName: z.string().trim().min(2, "Nom requis."),
    customerEmail: z.email().optional().or(z.literal("")),
    customerPhone: z.string().trim().min(8).optional().or(z.literal("")),
    startDate: dateInput,
    endDate: dateInput,
    totalPrice: z.number().min(0).max(1_000_000).optional(),
    initialStatus: z.enum([BookingStatus.CONFIRMED, BookingStatus.PENDING_REVIEW]),
    source: z.enum([BookingSource.PHONE, BookingSource.IN_PERSON]),
    amountPaid: z.number().min(0).max(1_000_000).optional(),
    paymentStatus: z.enum(PaymentStatus).optional(),
    paymentMethod: z.enum(PaymentMethod).nullable().optional(),
    paymentNote: z.string().max(500).optional(),
    internalNote: z.string().max(1000).optional(),
    sendConfirmationEmail: z.boolean().optional(),
  })
  .refine((data) => Boolean(data.customerEmail) || Boolean(data.customerPhone), {
    message: "Renseignez au moins un e-mail ou un téléphone.",
    path: ["customerPhone"],
  });

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();

    const searchParams = request.nextUrl.searchParams;
    const carId = searchParams.get("carId") ?? undefined;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const bookings = await prisma.booking.findMany({
      where: {
        ...(carId ? { carId } : {}),
        ...(startDate || endDate
          ? {
              startDate: {
                ...(startDate ? { gte: new Date(startDate) } : {}),
                ...(endDate ? { lte: new Date(endDate) } : {}),
              },
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        car: { select: { id: true, brand: true, model: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
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
    const parsed = manualBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const result = await createManualBooking({
      carId: data.carId,
      customerName: data.customerName,
      customerEmail: data.customerEmail || undefined,
      customerPhone: data.customerPhone || undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      totalPrice: data.totalPrice,
      initialStatus: data.initialStatus,
      source: data.source,
      amountPaid: data.amountPaid,
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod ?? null,
      paymentNote: data.paymentNote,
      internalNote: data.internalNote,
      sendConfirmationEmail: data.sendConfirmationEmail,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Création de la réservation impossible.";
    const isUnavailable = message.toLowerCase().includes("indisponible");
    return NextResponse.json({ error: message }, { status: isUnavailable ? 409 : 400 });
  }
}
