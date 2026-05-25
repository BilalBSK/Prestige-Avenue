import { validateCsrf } from "@/lib/csrf";
import { createBookingRequest } from "@/services/booking.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const dateInput = z.union([z.iso.datetime(), z.iso.date()]);

const requestSchema = z.object({
  carId: z.string().min(1),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  phone: z.string().min(8),
  startDate: dateInput,
  endDate: dateInput,
  customerMessage: z.string().max(500).optional(),
  submissionToken: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: "CSRF token invalide." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const result = await createBookingRequest(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la création de la demande.";
    const isUnavailable = message.toLowerCase().includes("indisponible");
    const status = isUnavailable ? 409 : 422;
    return NextResponse.json({ error: message }, { status });
  }
}
