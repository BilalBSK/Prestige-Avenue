"use client";

import { useEffect, useState } from "react";
import { useBookingSheet } from "./booking-sheet-provider";

interface CarReserveBarProps {
  brand: string;
  model: string;
  pricePerDay: number;
  pricePerKm: number | null;
}

export function CarReserveBar({ brand, model, pricePerDay, pricePerKm }: CarReserveBarProps) {
  const { openSheet } = useBookingSheet();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const heroSentinel = document.getElementById("reserve-bar-show");
    const ctaSentinel = document.getElementById("reserve-bar-hide");
    if (!heroSentinel || !ctaSentinel) return;

    let pastHero = false;
    let inCta = false;

    const update = () => setVisible(pastHero && !inCta);

    const heroObs = new IntersectionObserver(
      ([entry]) => {
        pastHero = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        update();
      },
      { threshold: 0 },
    );

    const ctaObs = new IntersectionObserver(
      ([entry]) => {
        inCta = entry.isIntersecting;
        update();
      },
      { threshold: 0.05 },
    );

    heroObs.observe(heroSentinel);
    ctaObs.observe(ctaSentinel);
    return () => {
      heroObs.disconnect();
      ctaObs.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`reserve-bar fixed inset-x-0 top-16 z-30 border-b border-[var(--ink-line)] bg-[rgba(5,5,5,0.92)] backdrop-blur-md transition-[transform,opacity] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div className="lux-container flex h-14 items-center justify-between gap-4 md:h-[60px]">
        <div className="flex min-w-0 items-baseline gap-3 md:gap-5">
          <p className="truncate font-[family:var(--font-fraunces)] text-[15px] font-light tracking-[-0.01em] text-[var(--ink-ivory)] md:text-[17px]">
            {brand} <em className="italic font-normal">{model}</em>
          </p>
          <span aria-hidden className="hidden h-3 w-px bg-[var(--ink-line-soft)] sm:block" />
          <p className="hidden whitespace-nowrap font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.22em] text-[var(--ink-text-soft)] sm:block">
            <span className="text-[var(--ink-ivory)]">
              {pricePerDay.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
            </span>
            <span className="ml-1.5 text-[var(--ink-muted)]">/ jour</span>
            {pricePerKm !== null && (
              <span className="ml-2 text-[var(--ink-muted)]">
                + {pricePerKm.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/km
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={openSheet}
          className="group inline-flex flex-shrink-0 items-center gap-3 border border-[var(--ink-ivory)] bg-[var(--ink-ivory)] px-5 py-2.5 transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-px hover:shadow-[0_12px_30px_-15px_rgba(255,255,255,0.4)]"
        >
          <span className="font-[family:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ink-onyx)]">
            Réserver
          </span>
          <span
            aria-hidden
            className="font-[family:var(--font-fraunces)] text-[14px] not-italic text-[var(--ink-onyx)] transition-transform duration-300 ease-out group-hover:translate-x-0.5"
          >
            →
          </span>
        </button>
      </div>
    </div>
  );
}
