import { parseCalendarDate } from "@/lib/calendar-date";
import { getUnavailableRanges } from "@/services/booking.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

/** Minuit UTC d'aujourd'hui, plus `months` mois et `days` jours. */
function utcShift(months: number, days: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + months, now.getUTCDate() + days),
  );
}

/**
 * Périodes indisponibles d'un véhicule sur une fenêtre, pour griser le calendrier
 * public. Publique et `no-store` (fraîcheur). Bornes par défaut : aujourd'hui →
 * +2 mois + 7 jours de marge, ce qui couvre toute la fenêtre sélectionnable du
 * calendrier (today → addMonths(today, 2) + 1) ainsi que les jours de débordement
 * de la grille mensuelle. Un échec renvoie `{ ranges: [] }` (200) : ne jamais
 * empêcher de réserver — la transaction serveur reste le garde-fou autoritatif.
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const parsed = querySchema.safeParse({
      from: request.nextUrl.searchParams.get("from") ?? undefined,
      to: request.nextUrl.searchParams.get("to") ?? undefined,
    });

    const from = parsed.success && parsed.data.from
      ? parseCalendarDate(parsed.data.from)
      : utcShift(0, 0);
    const to = parsed.success && parsed.data.to
      ? parseCalendarDate(parsed.data.to)
      : utcShift(2, 7);

    if (to.getTime() <= from.getTime()) {
      return NextResponse.json({ ranges: [] }, { status: 200 });
    }

    const ranges = await getUnavailableRanges(id, from, to);
    return NextResponse.json(
      { ranges },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[unavailable] failed:", error);
    return NextResponse.json({ ranges: [] }, { status: 200 });
  }
}
