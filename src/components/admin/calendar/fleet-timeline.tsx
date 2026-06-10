"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { GridDay, SegmentPlacement } from "@/lib/admin/calendar-grid";
import type { ScheduleCar, ScheduleSegment } from "@/services/calendar.service";
import {
  SOURCE_LABEL,
  STATUS_BAR_COLOR,
  STATUS_LABEL,
} from "@/lib/admin/booking-display";
import { BookingStatus } from "@prisma/client";
import { SegmentDetailPanel } from "./segment-detail-panel";

const DAY_WIDTH = 48; // px par jour
const VEHICLE_COL = 216; // px, colonne véhicule figée
const LANE_HEIGHT = 40; // px par voie d'empilement
const ROW_PAD = 10; // px de marge verticale dans une rangée

export interface TimelineRow {
  car: ScheduleCar;
  placements: SegmentPlacement<ScheduleSegment>[];
  laneCount: number;
}

interface FleetTimelineProps {
  rows: TimelineRow[];
  days: GridDay[];
  todayIndex: number | null;
  monthLabel: string;
  prevMonth: string;
  nextMonth: string;
  currentMonthParam: string;
  thisMonthParam: string;
}

export function FleetTimeline({
  rows,
  days,
  todayIndex,
  monthLabel,
  prevMonth,
  nextMonth,
  currentMonthParam,
  thisMonthParam,
}: FleetTimelineProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<ScheduleSegment | null>(null);

  const trackWidth = days.length * DAY_WIDTH;
  const isViewingThisMonth = currentMonthParam === thisMonthParam;

  // Au montage / changement de mois : centre la colonne du jour si elle est visible.
  useEffect(() => {
    const node = scrollRef.current;
    if (!node || todayIndex === null) return;
    const target = todayIndex * DAY_WIDTH - node.clientWidth / 2 + VEHICLE_COL;
    node.scrollTo({ left: Math.max(0, target), behavior: "auto" });
  }, [todayIndex, currentMonthParam]);

  return (
    <div className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]">
      {/* Barre d'outils : navigation mois + légende */}
      <div className="flex flex-col gap-3 border-b border-[color:var(--admin-line)] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MonthNavLink href={`/admin/calendar?month=${prevMonth}`} dir="prev" label="Mois précédent" />
          <h2 className="min-w-[150px] text-center text-[0.9375rem] font-semibold tracking-tight text-[color:var(--admin-text)]">
            {monthLabel}
          </h2>
          <MonthNavLink href={`/admin/calendar?month=${nextMonth}`} dir="next" label="Mois suivant" />
          {!isViewingThisMonth && (
            <Link
              href="/admin/calendar"
              className="ml-1 rounded-md border border-[color:var(--admin-line-strong)] px-2.5 py-1.5 text-[0.75rem] font-medium text-[color:var(--admin-text-soft)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]"
            >
              Aujourd&apos;hui
            </Link>
          )}
        </div>
        <Legend />
      </div>

      {rows.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          ref={scrollRef}
          className="admin-timeline-scroll overflow-auto"
          style={{ maxHeight: "calc(100vh - 19rem)" }}
        >
          <div style={{ width: VEHICLE_COL + trackWidth, minWidth: "100%" }}>
            {/* En-tête des jours — figé en haut */}
            <div className="sticky top-0 z-30 flex border-b border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)]">
              <div
                className="sticky left-0 z-10 flex shrink-0 items-center border-r border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] px-4 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[color:var(--admin-text-muted)]"
                style={{ width: VEHICLE_COL }}
              >
                Véhicule
              </div>
              <div className="relative flex" style={{ width: trackWidth }}>
                {days.map((day, i) => (
                  <div
                    key={i}
                    className={`flex shrink-0 flex-col items-center justify-center py-2 ${
                      day.isWeekend ? "bg-[color:var(--admin-surface-2)]" : ""
                    }`}
                    style={{ width: DAY_WIDTH }}
                  >
                    <span className="text-[0.625rem] uppercase text-[color:var(--admin-text-muted)]">
                      {day.weekdayInitial}
                    </span>
                    <span
                      className={`admin-tabular mt-0.5 text-[0.8125rem] ${
                        todayIndex === i
                          ? "flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--admin-accent)] font-semibold text-black"
                          : "text-[color:var(--admin-text-soft)]"
                      }`}
                    >
                      {day.dayOfMonth}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rangées véhicules */}
            {rows.map(({ car, placements, laneCount }) => {
              const rowHeight = laneCount * LANE_HEIGHT + ROW_PAD * 2;
              return (
                <div
                  key={car.id}
                  className="flex border-b border-[color:var(--admin-line)] last:border-0"
                  style={{ height: rowHeight }}
                >
                  {/* Cellule véhicule figée à gauche */}
                  <div
                    className="sticky left-0 z-20 flex shrink-0 items-center gap-2.5 border-r border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] px-3"
                    style={{ width: VEHICLE_COL }}
                  >
                    <div className="relative h-9 w-12 shrink-0 overflow-hidden rounded bg-[color:var(--admin-surface)]">
                      {car.mainImage && (
                        <Image
                          src={car.mainImage}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
                        {car.brand}
                      </div>
                      <div className="truncate text-[0.75rem] text-[color:var(--admin-text-muted)]">
                        {car.model}
                      </div>
                    </div>
                  </div>

                  {/* Piste : fond quadrillé + barres positionnées */}
                  <div className="relative" style={{ width: trackWidth }}>
                    {/* Colonnes de fond (week-ends grisés) */}
                    <div className="absolute inset-0 flex">
                      {days.map((day, i) => (
                        <div
                          key={i}
                          className={`shrink-0 border-r border-[color:var(--admin-line-soft)] ${
                            day.isWeekend ? "bg-[color:var(--admin-surface-2)]/40" : ""
                          }`}
                          style={{ width: DAY_WIDTH }}
                        />
                      ))}
                    </div>

                    {/* Ligne verticale « aujourd'hui » */}
                    {todayIndex !== null && (
                      <div
                        aria-hidden
                        className="absolute top-0 bottom-0 z-10 w-px bg-[color:var(--admin-accent)]/60"
                        style={{ left: todayIndex * DAY_WIDTH + DAY_WIDTH / 2 }}
                      />
                    )}

                    {/* Barres */}
                    {placements.map((p) => (
                      <SegmentBar
                        key={p.segment.id}
                        placement={p}
                        onSelect={() => setSelected(p.segment)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SegmentDetailPanel segment={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function SegmentBar({
  placement,
  onSelect,
}: {
  placement: SegmentPlacement<ScheduleSegment>;
  onSelect: () => void;
}) {
  const { segment, startIndex, endIndex, clippedStart, clippedEnd, lane } = placement;
  const left = startIndex * DAY_WIDTH;
  const width = (endIndex - startIndex) * DAY_WIDTH;
  const top = lane * LANE_HEIGHT + ROW_PAD;

  const isBlock = segment.kind === "block";
  const isPending = !isBlock && segment.status === BookingStatus.PENDING_REVIEW;
  const color = isBlock ? "var(--admin-text-muted)" : STATUS_BAR_COLOR[segment.status];

  const label = isBlock
    ? segment.reason || "Indisponible"
    : segment.customerName;

  const sublabel = isBlock
    ? "Indisponibilité"
    : `${STATUS_LABEL[segment.status]}${
        segment.source !== "WEBSITE" ? ` · ${SOURCE_LABEL[segment.source]}` : ""
      }`;

  // Pastille de règlement (seulement réservations non clôturées non réglées).
  const showPaymentDot =
    !isBlock &&
    segment.status !== BookingStatus.COMPLETED &&
    segment.paymentStatus !== "PAID";

  return (
    <button
      type="button"
      onClick={onSelect}
      title={`${label} — ${sublabel}`}
      className="group absolute flex flex-col justify-center overflow-hidden rounded-md px-2 text-left transition-[filter,transform] hover:z-20 hover:brightness-110 focus-visible:z-20"
      style={{
        left: left + 2,
        width: Math.max(DAY_WIDTH - 4, width - 4),
        top,
        height: LANE_HEIGHT - 8,
        backgroundColor: isBlock ? "transparent" : `color-mix(in srgb, ${color} 22%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 55%, transparent)`,
        borderStyle: isBlock || isPending ? "dashed" : "solid",
        borderTopLeftRadius: clippedStart ? 0 : undefined,
        borderBottomLeftRadius: clippedStart ? 0 : undefined,
        borderTopRightRadius: clippedEnd ? 0 : undefined,
        borderBottomRightRadius: clippedEnd ? 0 : undefined,
        backgroundImage: isBlock
          ? `repeating-linear-gradient(45deg, color-mix(in srgb, ${color} 18%, transparent) 0 6px, transparent 6px 12px)`
          : undefined,
      }}
    >
      {/* Liseré de couleur à gauche */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ backgroundColor: color, borderRadius: "3px 0 0 3px" }}
      />
      <span className="flex items-center gap-1 truncate pl-1.5 text-[0.75rem] font-medium leading-tight text-[color:var(--admin-text)]">
        {showPaymentDot && (
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
            style={{
              backgroundColor:
                segment.kind === "booking" && segment.paymentStatus === "PARTIAL"
                  ? "var(--admin-warn)"
                  : "var(--admin-danger)",
            }}
          />
        )}
        <span className="truncate">{label}</span>
      </span>
      {width > DAY_WIDTH * 1.5 && (
        <span className="truncate pl-1.5 text-[0.625rem] leading-tight text-[color:var(--admin-text-muted)]">
          {sublabel}
        </span>
      )}
    </button>
  );
}

function Legend() {
  const items: { label: string; color: string; dashed?: boolean; striped?: boolean }[] = [
    { label: "Confirmée", color: "var(--admin-success)" },
    { label: "En cours", color: "var(--admin-info)" },
    { label: "À valider", color: "var(--admin-warn)", dashed: true },
    { label: "Clôturée", color: "var(--admin-text-muted)" },
    { label: "Indisponible", color: "var(--admin-text-muted)", striped: true },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[0.6875rem] text-[color:var(--admin-text-soft)]">
          <span
            aria-hidden
            className="h-3 w-4 rounded-sm border"
            style={{
              backgroundColor: item.striped
                ? "transparent"
                : `color-mix(in srgb, ${item.color} 22%, transparent)`,
              borderColor: `color-mix(in srgb, ${item.color} 55%, transparent)`,
              borderStyle: item.dashed || item.striped ? "dashed" : "solid",
              backgroundImage: item.striped
                ? `repeating-linear-gradient(45deg, color-mix(in srgb, ${item.color} 30%, transparent) 0 3px, transparent 3px 6px)`
                : undefined,
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function MonthNavLink({ href, dir, label }: { href: string; dir: "prev" | "next"; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-[color:var(--admin-line-strong)] text-[color:var(--admin-text-soft)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d={dir === "prev" ? "M8.5 3L4.5 7l4 4" : "M5.5 3l4 4-4 4"}
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p className="text-[0.875rem] font-medium text-[color:var(--admin-text)]">
        Aucun véhicule dans la flotte
      </p>
      <p className="text-[0.8125rem] text-[color:var(--admin-text-muted)]">
        Ajoutez des véhicules pour les voir apparaître sur le planning.
      </p>
    </div>
  );
}
