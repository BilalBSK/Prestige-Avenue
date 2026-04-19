import { validateCsrf } from "@/lib/csrf";
import { createCheckoutSessionForBooking } from "@/services/booking.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const dateInput = z.union([z.iso.datetime(), z.iso.date()]);

const checkoutSchema = z.object({
  carId: z.string().min(1),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  phone: z.string().min(8),
  startDate: dateInput,
  endDate: dateInput,
  submissionToken: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: "CSRF token invalide." }, { status: 403 });
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Donnees invalides.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const origin = request.nextUrl.origin;
    const result = await createCheckoutSessionForBooking({
      carId: parsed.data.carId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      submissionToken: parsed.data.submissionToken,
      successUrl: `${origin}/booking/success?bookingId={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/booking/cancel`,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur lors de la creation checkout.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
