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

interface BookingCalendarProps {
  startDate: string;
  endDate: string;
  onChange: (next: { startDate: string; endDate: string }) => void;
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

export function BookingCalendar({ startDate, endDate, onChange }: BookingCalendarProps) {
  const today = useMemo(() => startOfToday(), []);
  // Selectable window: today → 2 months out + 1 checkout day (mirrors the booking rules).
  const minDate = today;
  const maxDate = useMemo(() => addDays(addMonths(today, 2), 1), [today]);

  const start = useMemo(() => fromYmd(startDate), [startDate]);
  const end = useMemo(() => fromYmd(endDate), [endDate]);

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

  function isDisabled(day: Date): boolean {
    return isBefore(day, minDate) || isAfter(day, maxDate);
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

  const nights = start && end ? differenceInCalendarDays(end, start) : 0;
  const isWeekendPackage =
    nights === 3 && start && end && getDay(start) === 5 && getDay(end) === 1;

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
      <div key={ymd(viewMonth)} className="cal-grid grid grid-cols-7">
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
                aria-label={`${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`}
                aria-pressed={isEndpoint}
                className="group relative z-10 flex h-full w-full items-center justify-center disabled:cursor-not-allowed"
              >
                {isEndpoint && (
                  <span className="absolute inset-[5px] rounded-full bg-[var(--ink-ivory)] shadow-[0_4px_14px_-4px_rgba(0,0,0,0.7)]" />
                )}
                {!disabled && !isEndpoint && (
                  <span className="absolute inset-[5px] rounded-full ring-1 ring-transparent transition-all duration-200 group-hover:bg-[var(--ink-elevated)] group-hover:ring-[var(--ink-line-soft)]" />
                )}
                <span
                  className={`relative font-[family:var(--font-dm-sans)] text-[13px] tabular-nums transition-colors duration-200 ${
                    disabled
                      ? "text-[var(--ink-dim)]"
                      : isEndpoint
                        ? "font-medium text-[var(--ink-onyx)]"
                        : inRange
                          ? "text-[var(--ink-ivory)]"
                          : "text-[var(--ink-text)] group-hover:text-[var(--ink-ivory)]"
                  }`}
                >
                  {day.getDate()}
                </span>
                {isToday && !isEndpoint && (
                  <span className="absolute bottom-[8px] h-[3px] w-[3px] rounded-full bg-[var(--ink-text-soft)]" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selection readout */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--ink-line)] pt-5">
        {start && end ? (
          <>
            <p className="font-[family:var(--font-fraunces)] text-[15px] italic text-[var(--ink-ivory)]">
              {formatLong(start)} <span className="not-italic text-[var(--ink-dim)]">→</span>{" "}
              {formatLong(end)}
            </p>
            <span className="flex-shrink-0 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.2em] text-[var(--ink-text-soft)]">
              {isWeekendPackage ? "Week-end" : `${nights} nuit${nights > 1 ? "s" : ""}`}
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
        @keyframes cal-fade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cal-grid { animation: none !important; }
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
