import { validateCsrf } from "@/lib/csrf";
import { requireAdminSession } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED", "FAILED"]).optional(),
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
    const parsed = updateBookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Donnees invalides." }, { status: 400 });
    }

    const { id } = await params;
    const booking = await prisma.booking.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ booking });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mise a jour impossible.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
