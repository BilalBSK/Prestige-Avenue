import { ManualBookingButton } from "@/components/admin/calendar/manual-booking-button";
import { FleetTimeline } from "@/components/admin/calendar/fleet-timeline";
import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
import {
  buildDays,
  dayDiff,
  monthLabel,
  monthWindow,
  placeSegments,
  shiftMonthParam,
} from "@/lib/admin/calendar-grid";
import { getFleetSchedule, type ScheduleSegment } from "@/services/calendar.service";

interface AdminCalendarPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function AdminCalendarPage({ searchParams }: AdminCalendarPageProps) {
  const { month } = await searchParams;
  const today = new Date();
  const { from, to } = monthWindow(month, today);

  const schedule = await getFleetSchedule({ from, to });
  const days = buildDays(from, to);
  const totalDays = days.length;

  // Placement des barres par véhicule (empilement en voies pour les conflits),
  // calculé côté serveur car purement déterministe.
  const rows = schedule.cars.map((car) => {
    const { placements, laneCount } = placeSegments<ScheduleSegment>(
      car.segments,
      from,
      to,
      totalDays,
    );
    return { car, placements, laneCount };
  });

  // Index de la colonne « aujourd'hui » s'il tombe dans la fenêtre affichée.
  const todayIndex =
    today >= from && today < to ? dayDiff(today, from) : null;

  const carOptions = schedule.cars.map((c) => ({
    id: c.id,
    brand: c.brand,
    model: c.model,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Planning"
        title="Calendrier de la flotte"
        lede="Vue d'ensemble des réservations, indisponibilités et disponibilités, véhicule par véhicule."
        meta={
          <>
            <PageMetaItem label="Confirmées / en cours" value={schedule.counts.confirmed} />
            <PageMetaItem label="À valider" value={schedule.counts.pending} />
            <PageMetaItem label="Indisponibilités" value={schedule.counts.blocked} />
          </>
        }
        actions={<ManualBookingButton cars={carOptions} />}
      />

      <FleetTimeline
        rows={rows}
        days={days}
        todayIndex={todayIndex}
        monthLabel={monthLabel(from)}
        prevMonth={shiftMonthParam(from, -1)}
        nextMonth={shiftMonthParam(from, 1)}
        currentMonthParam={shiftMonthParam(from, 0)}
        thisMonthParam={shiftMonthParam(monthWindow(undefined, today).from, 0)}
      />
    </>
  );
}
