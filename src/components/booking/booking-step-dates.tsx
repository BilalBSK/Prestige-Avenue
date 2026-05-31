"use client";

import { useEffect, useRef, useState } from "react";
import { BookingCalendarModal } from "./booking-calendar-modal";

const MONTHS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

// "2026-06-06" → "6 juin 2026"; falsy/invalid → "".
function formatFr(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return "";
  return `${Number(m[3])} ${MONTHS_FR[Number(m[2]) - 1]} ${m[1]}`;
}

interface BookingStepDatesProps {
  carId: string;
  pricePerDay: number;
  pricePerKm: number | null;
  weekendPackagePrice: number | null;
  startDate: string;
  endDate: string;
  onChange: (next: { startDate: string; endDate: string }) => void;
  onContinue: () => void;
  estimatedTotal: number;
}

interface AvailabilityState {
  status: "idle" | "checking" | "available" | "unavailable";
  message?: string;
}

export function BookingStepDates({
  carId,
  pricePerDay,
  pricePerKm,
  weekendPackagePrice,
  startDate,
  endDate,
  onChange,
  onContinue,
  estimatedTotal,
}: BookingStepDatesProps) {
  const [availability, setAvailability] = useState<AvailabilityState>({ status: "idle" });
  const [calendarOpen, setCalendarOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const hasRange = Boolean(startDate && endDate);

  useEffect(() => {
    if (!startDate || !endDate) {
      setAvailability({ status: "idle" });
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setAvailability({ status: "checking" });
      try {
        const response = await fetch(
          `/api/cars/${carId}/availability?startDate=${encodeURIComponent(
            startDate,
          )}&endDate=${encodeURIComponent(endDate)}`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as { isAvailable: boolean; reason?: string };
        setAvailability({
          status: data.isAvailable ? "available" : "unavailable",
          message: data.isAvailable
            ? "Période disponible."
            : data.reason ?? "Période indisponible.",
        });
      } catch {
        setAvailability({
          status: "unavailable",
          message: "Vérification impossible. Réessayez.",
        });
      }
    }, 350);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [carId, startDate, endDate]);

  const canContinue = availability.status === "available" && Boolean(startDate && endDate);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 pb-8 pt-8 sm:px-8">
        <div>
          <p className="mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            <span className="mr-3 inline-block h-px w-6 bg-[var(--ink-dim)] align-middle" />
            Période de location
          </p>
          <h3 className="font-[family:var(--font-fraunces)] text-[26px] font-light leading-[1.15] tracking-[-0.02em] text-[var(--ink-ivory)]">
            Choisissez vos <em className="italic font-normal">dates.</em>
          </h3>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            Dates de location
          </span>
          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={calendarOpen}
            className="group flex items-center gap-4 border border-[var(--ink-line-soft)] bg-[var(--ink-elevated)] px-4 py-3.5 text-left transition-colors duration-200 hover:border-[var(--ink-text-soft)] focus:border-[var(--ink-ivory)] focus:outline-none"
          >
            <CalendarIcon className="h-[20px] w-[20px] flex-shrink-0 text-[var(--ink-text-soft)] transition-colors duration-200 group-hover:text-[var(--ink-ivory)]" />
            {hasRange ? (
              <span className="flex min-w-0 flex-1 items-center gap-2 font-[family:var(--font-dm-sans)] text-[14px] text-[var(--ink-ivory)]">
                <span className="truncate">{formatFr(startDate)}</span>
                <span className="flex-shrink-0 text-[var(--ink-dim)]">→</span>
                <span className="truncate">{formatFr(endDate)}</span>
              </span>
            ) : (
              <span className="flex-1 font-[family:var(--font-dm-sans)] text-[14px] text-[var(--ink-muted)]">
                Sélectionnez vos dates
              </span>
            )}
            <span className="flex-shrink-0 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.2em] text-[var(--ink-muted)] transition-colors duration-200 group-hover:text-[var(--ink-text-soft)]">
              {hasRange ? "Modifier" : "Ouvrir"}
            </span>
          </button>
        </div>

        <BookingCalendarModal
          open={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          startDate={startDate}
          endDate={endDate}
          onChange={onChange}
        />

        <div
          className={`border-t border-[var(--ink-line)] pt-6 transition-opacity duration-300 ${
            availability.status === "idle" ? "opacity-50" : "opacity-100"
          }`}
        >
          <p className="mb-1 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            État
          </p>
          <p
            className={`font-[family:var(--font-fraunces)] text-[16px] italic ${
              availability.status === "available"
                ? "text-[var(--ink-ivory)]"
                : availability.status === "unavailable"
                  ? "text-[var(--ink-text-soft)]"
                  : "text-[var(--ink-muted)]"
            }`}
          >
            {availability.status === "checking"
              ? "Vérification…"
              : availability.message ?? "En attente des dates."}
          </p>
        </div>

        <div className="border-t border-[var(--ink-line)] pt-6">
          <div className="flex items-baseline justify-between">
            <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
              Estimation
            </p>
            <p className="font-[family:var(--font-fraunces)] text-[36px] font-light leading-none tracking-[-0.02em] text-[var(--ink-ivory)]">
              {estimatedTotal > 0
                ? `${estimatedTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                : "—"}
            </p>
          </div>
          <p className="mt-3 font-[family:var(--font-dm-sans)] text-[12px] leading-[1.6] text-[var(--ink-text-soft)]">
            Aucun paiement en ligne.
          </p>
          <p className="mt-2 font-[family:var(--font-fraunces)] text-[13px] italic text-[var(--ink-muted)]">
            Tarif jour {pricePerDay.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            {pricePerKm !== null
              ? ` + ${pricePerKm.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/km`
              : ""}
            {weekendPackagePrice !== null
              ? ` · Forfait week-end ${weekendPackagePrice.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`
              : ""}
          </p>
        </div>

        <div className="rounded-none border border-[var(--ink-line)] bg-[var(--ink-surface)] p-5">
          <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            Conditions
          </p>
          <ul className="mt-3 space-y-1.5 font-[family:var(--font-dm-sans)] text-[12px] leading-[1.6] text-[var(--ink-text-soft)]">
            <li>— Week-end : du vendredi au lundi.</li>
            <li>— 1 jour : lundi à jeudi, 1 à 2 semaines à l&apos;avance.</li>
            <li>— Calendrier ouvert sur 2 mois.</li>
            {pricePerKm !== null && (
              <li>— Kilométrage facturé au retour selon compteur.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--ink-line)] bg-[var(--ink-onyx)] px-5 py-5 sm:px-8">
        <button
          type="button"
          disabled={!canContinue}
          onClick={onContinue}
          className="w-full border border-[var(--ink-ivory)] bg-[var(--ink-ivory)] px-6 py-3.5 font-[family:var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-[0.3em] text-[var(--ink-onyx)] transition-colors duration-200 disabled:cursor-not-allowed disabled:border-[var(--ink-line-soft)] disabled:bg-transparent disabled:text-[var(--ink-muted)]"
        >
          Continuer
        </button>
      </div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
