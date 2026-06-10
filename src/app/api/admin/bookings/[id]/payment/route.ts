import { validateCsrf } from "@/lib/csrf";
import { requireAdminSession } from "@/lib/permissions";
import { updateBookingPayment } from "@/services/booking.service";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const paymentSchema = z.object({
  amountPaid: z.number().min(0).max(1_000_000).optional(),
  paymentStatus: z.enum(PaymentStatus).optional(),
  paymentMethod: z.enum(PaymentMethod).nullable().optional(),
  paymentNote: z.string().max(500).nullable().optional(),
  internalNote: z.string().max(1000).nullable().optional(),
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
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { id } = await params;
    const booking = await updateBookingPayment(id, parsed.data);
    return NextResponse.json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mise à jour impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
