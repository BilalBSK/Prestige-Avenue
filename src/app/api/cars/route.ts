import { getCars } from "@/services/car.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const filtersSchema = z.object({
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parsed = filtersSchema.safeParse({
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Filtres invalides." }, { status: 400 });
  }

  const cars = await getCars(parsed.data);
  return NextResponse.json({ cars });
}
