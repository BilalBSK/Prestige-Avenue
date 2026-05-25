import { checkAvailability } from "@/services/booking.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const dateInput = z.union([z.iso.datetime(), z.iso.date()]);

const availabilitySchema = z.object({
  startDate: dateInput,
  endDate: dateInput,
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const parsed = availabilitySchema.safeParse({
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { isAvailable: false, reason: "Dates invalides." },
        { status: 200 },
      );
    }

    const result = await checkAvailability({
      carId: id,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[availability] failed:", error);
    return NextResponse.json(
      {
        isAvailable: false,
        reason:
          error instanceof Error
            ? error.message
            : "Vérification temporairement indisponible. Réessayez.",
      },
      { status: 200 },
    );
  }
}
