"use client";

import { useBookingSheet } from "./booking-sheet-provider";

export function CarHeroCta() {
  const { openSheet } = useBookingSheet();

  return (
    <button
      type="button"
      onClick={openSheet}
      className="hero-lede2 group inline-flex items-center gap-4 border border-[var(--ink-ivory)] bg-[var(--ink-ivory)] px-7 py-3.5 transition-[transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-30px_rgba(255,255,255,0.5)]"
    >
      <span className="font-[family:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--ink-onyx)]">
        Réserver
      </span>
      <span className="relative h-[14px] w-[14px] overflow-hidden">
        <span className="cta-arrow-track absolute inset-0 flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
          <span className="flex h-[14px] items-center justify-center font-[family:var(--font-fraunces)] text-[15px] not-italic text-[var(--ink-onyx)]">
            →
          </span>
          <span className="flex h-[14px] items-center justify-center font-[family:var(--font-fraunces)] text-[15px] not-italic text-[var(--ink-onyx)]">
            →
          </span>
        </span>
      </span>
    </button>
  );
}
