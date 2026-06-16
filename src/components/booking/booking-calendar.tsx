"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  getDay,
  isAfter,
  isBefore,
  isSameDay,
  startOfMonth,
  startOfToday,
} from "date-fns";

/** Période indisponible `[start, end[` (end = jour de restitution, exclu). */
export interface UnavailableRange {
  start: string;
  end: string;
}

interface BookingCalendarProps {
  startDate: string;
  endDate: string;
  onChange: (next: { startDate: string; endDate: string }) => void;
  /** Périodes déjà réservées (confirmées) ou bloquées par l'agence. */
  unavailableRanges?: UnavailableRange[];
  /** Le chargement des disponibilités est en cours. */
  loading?: boolean;
}

// French labels — UI is entirely French; hardcoded to stay locale-import-free.
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const WEEKDAYS = ["lu", "ma", "me", "je", "ve", "sa", "di"]; // Monday-first
const WEEKDAY_LONG = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

// Local yyyy-MM-dd round-trip — matches how the rest of the flow formats dates.
function ymd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function fromYmd(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}
// Monday-first weekday index (0 = Monday … 6 = Sunday).
function mondayIndex(date: Date): number {
  return (getDay(date) + 6) % 7;
}
function formatLong(date: Date): string {
  return `${WEEKDAY_LONG[mondayIndex(date)]} ${date.getDate()} ${MONTHS[date.getMonth()].toLowerCase()}`;
}

export function BookingCalendar({
  startDate,
  endDate,
  onChange,
  unavailableRanges = [],
  loading = false,
}: BookingCalendarProps) {
  const today = useMemo(() => startOfToday(), []);
  // Selectable window: today → 2 months out + 1 checkout day (mirrors the booking rules).
  const minDate = today;
  const maxDate = useMemo(() => addDays(addMonths(today, 2), 1), [today]);

  const start = useMemo(() => fromYmd(startDate), [startDate]);
  const end = useMemo(() => fromYmd(endDate), [endDate]);

  // Plages indisponibles en bornes `Date` (minuit local, comme le reste du calendrier).
  const blocks = useMemo(
    () =>
      unavailableRanges
        .map((r) => ({ start: fromYmd(r.start), end: fromYmd(r.end) }))
        .filter((r): r is { start: Date; end: Date } => r.start !== null && r.end !== null),
    [unavailableRanges],
  );

  // Un jour est occupé s'il tombe dans `[start, end[` d'une plage. Le jour `end`
  // (restitution) reste libre : c'est un jour de prise en charge possible.
  function isOccupied(day: Date): boolean {
    return blocks.some((b) => !isBefore(day, b.start) && isBefore(day, b.end));
  }

  // Premier jour occupé strictement après `from` (borne le choix de la date de
  // fin : une location ne peut pas enjamber une période déjà prise).
  function firstOccupiedAfter(from: Date): Date | null {
    let best: Date | null = null;
    for (const b of blocks) {
      if (isAfter(b.start, from) && (best === null || isBefore(b.start, best))) {
        best = b.start;
      }
    }
    return best;
  }

  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(start ?? today),
  );

  const minMonth = startOfMonth(minDate);
  const maxMonth = startOfMonth(maxDate);
  const prevDisabled = !isAfter(viewMonth, minMonth);
  const nextDisabled = !isBefore(viewMonth, maxMonth);

  // Build the grid: leading blanks (Monday-first) + month days, padded to full weeks.
  const cells = useMemo<(Date | null)[]>(() => {
    const first = startOfMonth(viewMonth);
    const days = eachDayOfInterval({ start: first, end: endOfMonth(viewMonth) });
    const lead = mondayIndex(first);
    const grid: (Date | null)[] = [...Array<null>(lead).fill(null), ...days];
    while (grid.length % 7 !== 0) grid.push(null);
    return grid;
  }, [viewMonth]);

  // Phase de sélection en cours et plafond associé (1ᵉʳ jour occupé après le
  // début : la date de fin ne peut pas l'enjamber). Calcul direct — une passe sur
  // un petit tableau, pas besoin de mémoïsation.
  const choosingEnd = !!start && !end;
  const capDate = choosingEnd && start ? firstOccupiedAfter(start) : null;

  function isOutOfWindow(day: Date): boolean {
    return isBefore(day, minDate) || isAfter(day, maxDate);
  }

  // Le jour est-il non sélectionnable dans la phase courante ?
  function isDisabled(day: Date): boolean {
    if (isOutOfWindow(day)) return true;

    if (!choosingEnd) {
      // Phase « choix du début » (ou sélection terminée → nouveau départ) : un
      // jour occupé ne peut pas être un début.
      return isOccupied(day);
    }

    // Phase « choix de la fin ».
    if (start && isSameDay(day, start)) return false; // retaper le début = effacer
    if (start && isBefore(day, start)) return isOccupied(day); // début antérieur = redémarrage
    // Jour postérieur au début : plafonné au premier jour occupé (qui reste, lui,
    // sélectionnable comme jour de restitution).
    if (capDate && isAfter(day, capDate)) return true;
    return false;
  }

  function selectDay(day: Date) {
    if (isDisabled(day)) return;
    // No start yet, or a complete range exists → begin a fresh selection.
    if (!start || (start && end)) {
      onChange({ startDate: ymd(day), endDate: "" });
      return;
    }
    // Start set, choosing the end.
    if (isSameDay(day, start)) {
      onChange({ startDate: "", endDate: "" }); // tap the start again to clear
      return;
    }
    if (isBefore(day, start)) {
      onChange({ startDate: ymd(day), endDate: "" }); // earlier tap restarts
      return;
    }
    onChange({ startDate: startDate, endDate: ymd(day) });
  }

  const rentalDays = start && end ? differenceInCalendarDays(end, start) : 0;
  // Motif de week-end (cf. lib/booking.ts) — 72h: ven→lun ; 48h: ven→dim ou sam→lun.
  const weekendLabel = (() => {
    if (!start || !end) return null;
    const s = getDay(start);
    const e = getDay(end);
    if (rentalDays === 3 && s === 5 && e === 1) return "Week-end 72h";
    if (rentalDays === 2 && ((s === 5 && e === 0) || (s === 6 && e === 1))) return "Week-end 48h";
    return null;
  })();

  const hasBlocks = blocks.length > 0;

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="mb-5 flex items-center justify-between">
        <h4 className="font-[family:var(--font-fraunces)] text-[19px] font-light tracking-[-0.01em] text-[var(--ink-ivory)]">
          {MONTHS[viewMonth.getMonth()]}{" "}
          <span className="text-[var(--ink-text-soft)]">{viewMonth.getFullYear()}</span>
        </h4>
        <div className="flex items-center gap-1.5">
          <NavButton
            label="Mois précédent"
            disabled={prevDisabled}
            onClick={() => setViewMonth((m) => addMonths(m, -1))}
            dir="prev"
          />
          <NavButton
            label="Mois suivant"
            disabled={nextDisabled}
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            dir="next"
          />
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((wd, i) => (
          <div
            key={wd + i}
            className={`pb-2 text-center font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.18em] ${
              i >= 4 ? "text-[var(--ink-soft)]" : "text-[var(--ink-muted)]"
            }`}
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div
        key={ymd(viewMonth)}
        aria-busy={loading}
        className={`cal-grid grid grid-cols-7 ${loading ? "cal-grid-loading" : ""}`}
      >
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="aspect-square" />;

          const disabled = isDisabled(day);
          const isStart = !!start && isSameDay(day, start);
          const isEnd = !!end && isSameDay(day, end);
          const isEndpoint = isStart || isEnd;
          const inRange =
            !!start && !!end && isAfter(day, start) && isBefore(day, end);
          const isToday = isSameDay(day, today);
          const hasRange = !!start && !!end;
          // Occupé = réservé/bloqué, hors point sélectionné. Quand on choisit la
          // fin, le plafond (jour de restitution possible) n'est pas hachuré : il
          // est offert comme arrivée.
          const isCapDay = !!capDate && isSameDay(day, capDate);
          const occupied = isOccupied(day) && !isEndpoint && !(choosingEnd && isCapDay);

          // Continuous selection band (rounded at the open ends).
          const showBand = inRange || (isStart && hasRange) || (isEnd && hasRange);
          const bandClass = inRange
            ? "left-0 right-0"
            : isStart
              ? "left-1/2 right-0"
              : "left-0 right-1/2";

          return (
            <div key={ymd(day)} className="relative aspect-square">
              {showBand && (
                <div
                  aria-hidden
                  className={`absolute inset-y-[6px] ${bandClass} bg-[var(--ink-elevated)]`}
                />
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => selectDay(day)}
                aria-label={`${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}${
                  occupied ? " — indisponible" : ""
                }`}
                aria-pressed={isEndpoint}
                className="group relative z-10 flex h-full w-full items-center justify-center disabled:cursor-not-allowed"
              >
                {isEndpoint && (
                  <span className="absolute inset-[5px] rounded-full bg-[var(--ink-ivory)] shadow-[0_4px_14px_-4px_rgba(0,0,0,0.7)]" />
                )}
                {occupied && (
                  <span
                    aria-hidden
                    className="cal-unavail absolute inset-[5px] rounded-full ring-1 ring-[var(--ink-line)]"
                  />
                )}
                {!disabled && !isEndpoint && !occupied && (
                  <span className="absolute inset-[5px] rounded-full ring-1 ring-transparent transition-all duration-200 group-hover:bg-[var(--ink-elevated)] group-hover:ring-[var(--ink-line-soft)]" />
                )}
                <span
                  className={`relative font-[family:var(--font-dm-sans)] text-[13px] tabular-nums transition-colors duration-200 ${
                    isEndpoint
                      ? "font-medium text-[var(--ink-onyx)]"
                      : occupied
                        ? "text-[var(--ink-muted)] line-through decoration-[var(--ink-dim)] decoration-1"
                        : disabled
                          ? "text-[var(--ink-dim)]"
                          : inRange
                            ? "text-[var(--ink-ivory)]"
                            : "text-[var(--ink-text)] group-hover:text-[var(--ink-ivory)]"
                  }`}
                >
                  {day.getDate()}
                </span>
                {isToday && !isEndpoint && !occupied && (
                  <span className="absolute bottom-[8px] h-[3px] w-[3px] rounded-full bg-[var(--ink-text-soft)]" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend — only when there are unavailable periods to explain. */}
      {hasBlocks && (
        <div className="mt-4 flex items-center gap-2.5">
          <span
            aria-hidden
            className="cal-unavail inline-block h-[15px] w-[15px] flex-shrink-0 rounded-full ring-1 ring-[var(--ink-line)]"
          />
          <span className="font-[family:var(--font-dm-sans)] text-[11px] tracking-[0.04em] text-[var(--ink-text-soft)]">
            Indisponible — déjà réservé
          </span>
        </div>
      )}

      {/* Selection readout */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--ink-line)] pt-5">
        {start && end ? (
          <>
            <p className="font-[family:var(--font-fraunces)] text-[15px] italic text-[var(--ink-ivory)]">
              {formatLong(start)} <span className="not-italic text-[var(--ink-dim)]">→</span>{" "}
              {formatLong(end)}
            </p>
            <span className="flex-shrink-0 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.2em] text-[var(--ink-text-soft)]">
              {weekendLabel ?? `${rentalDays} jour${rentalDays > 1 ? "s" : ""}`}
            </span>
          </>
        ) : (
          <p className="font-[family:var(--font-fraunces)] text-[15px] italic text-[var(--ink-muted)]">
            {start ? "Choisissez la date de fin." : "Sélectionnez votre période."}
          </p>
        )}
      </div>

      <style>{`
        .cal-grid {
          animation: cal-fade 360ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        /* Hachures diagonales discrètes — jour réservé/bloqué. */
        .cal-unavail {
          background-image: repeating-linear-gradient(
            -45deg,
            rgba(161, 161, 170, 0.26) 0px,
            rgba(161, 161, 170, 0.26) 1px,
            transparent 1px,
            transparent 5px
          );
        }
        /* Voile pulsé pendant le chargement des disponibilités. */
        .cal-grid-loading {
          animation: cal-fade 360ms cubic-bezier(0.16, 1, 0.3, 1),
            cal-pulse 1100ms ease-in-out infinite;
        }
        @keyframes cal-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cal-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cal-grid, .cal-grid-loading { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function NavButton({
  label,
  disabled,
  onClick,
  dir,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  dir: "prev" | "next";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center border border-[var(--ink-line-soft)] text-[var(--ink-text-soft)] transition-colors duration-200 hover:border-[var(--ink-text-soft)] hover:text-[var(--ink-ivory)] disabled:cursor-not-allowed disabled:border-[var(--ink-line)] disabled:text-[var(--ink-dim)] disabled:hover:border-[var(--ink-line)]"
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
    </button>
  );
}
