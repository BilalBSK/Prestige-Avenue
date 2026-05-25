"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDays, addMonths, format } from "date-fns";

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
  const debounceRef = useRef<number | null>(null);

  const minStart = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const maxStart = useMemo(() => format(addMonths(new Date(), 2), "yyyy-MM-dd"), []);
  const maxEnd = useMemo(
    () => format(addDays(addMonths(new Date(), 2), 1), "yyyy-MM-dd"),
    [],
  );

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
      <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-8 pb-8 pt-8">
        <div>
          <p className="mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            <span className="mr-3 inline-block h-px w-6 bg-[var(--ink-dim)] align-middle" />
            Période de location
          </p>
          <h3 className="font-[family:var(--font-fraunces)] text-[26px] font-light leading-[1.15] tracking-[-0.02em] text-[var(--ink-ivory)]">
            Choisissez vos <em className="italic font-normal">dates.</em>
          </h3>
        </div>

        <div className="grid gap-4">
          <label className="flex flex-col gap-2">
            <span className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
              Date de début
            </span>
            <input
              type="date"
              value={startDate}
              min={minStart}
              max={maxStart}
              onChange={(e) => onChange({ startDate: e.target.value, endDate })}
              className="border border-[var(--ink-line-soft)] bg-[var(--ink-elevated)] px-4 py-3 font-[family:var(--font-dm-sans)] text-[14px] text-[var(--ink-ivory)] outline-none transition-colors focus:border-[var(--ink-ivory)]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
              Date de fin
            </span>
            <input
              type="date"
              value={endDate}
              min={minStart}
              max={maxEnd}
              onChange={(e) => onChange({ startDate, endDate: e.target.value })}
              className="border border-[var(--ink-line-soft)] bg-[var(--ink-elevated)] px-4 py-3 font-[family:var(--font-dm-sans)] text-[14px] text-[var(--ink-ivory)] outline-none transition-colors focus:border-[var(--ink-ivory)]"
            />
          </label>
        </div>

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
            Aucun paiement en ligne. Le règlement intervient à la remise.
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
            <li>— Week-end : du vendredi au lundi (3 nuits).</li>
            <li>— 1 jour : lundi à jeudi, 1 à 2 semaines à l&apos;avance.</li>
            <li>— Calendrier ouvert sur 2 mois.</li>
            {pricePerKm !== null && (
              <li>— Kilométrage facturé au retour selon compteur.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--ink-line)] bg-[var(--ink-onyx)] px-8 py-5">
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
