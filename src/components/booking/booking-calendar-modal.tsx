"use client";

import { useEffect } from "react";
import { BookingCalendar } from "./booking-calendar";

interface BookingCalendarModalProps {
  open: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
  onChange: (next: { startDate: string; endDate: string }) => void;
}

export function BookingCalendarModal({
  open,
  onClose,
  startDate,
  endDate,
  onChange,
}: BookingCalendarModalProps) {
  // Escape closes the calendar only. Capture-phase + stopImmediatePropagation
  // intercepts the key before the parent Sheet's window listener fires, so the
  // whole booking drawer doesn't close underneath.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  if (!open) return null;

  const hasRange = Boolean(startDate && endDate);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choisir les dates"
      data-lenis-prevent
    >
      <button
        type="button"
        aria-label="Fermer le calendrier"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/80 backdrop-blur-[3px] animate-[cal-modal-fade_220ms_ease-out_forwards]"
      />

      <div
        data-lenis-prevent
        className="relative z-10 flex max-h-[92vh] w-full max-w-[440px] flex-col overflow-hidden border border-[var(--ink-line-soft)] bg-[var(--ink-surface)] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] animate-[cal-modal-up_360ms_cubic-bezier(0.16,1,0.3,1)_forwards] sm:animate-[cal-modal-in_360ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
      >
        {/* Ambient glow for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[15%] -top-[10%] h-[45vw] w-[45vw] max-h-[260px] max-w-[260px] rounded-full bg-[radial-gradient(circle,rgba(250,250,250,0.06),transparent_70%)] blur-2xl"
        />

        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--ink-line)] px-6 pb-5 pt-6">
          <p className="flex items-center gap-3 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.3em] text-[var(--ink-muted)]">
            <span className="inline-block h-px w-6 bg-[var(--ink-dim)]" />
            Vos dates
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le calendrier"
            className="-mr-2 flex h-9 w-9 items-center justify-center text-[var(--ink-text-soft)] transition-colors duration-200 hover:text-[var(--ink-ivory)]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Calendar */}
        <div className="relative flex-1 overflow-y-auto overscroll-contain px-6 py-6">
          <BookingCalendar startDate={startDate} endDate={endDate} onChange={onChange} />
        </div>

        {/* Footer actions */}
        <div className="flex flex-shrink-0 items-center gap-3 border-t border-[var(--ink-line)] bg-[var(--ink-onyx)] px-6 py-5">
          <button
            type="button"
            onClick={() => onChange({ startDate: "", endDate: "" })}
            disabled={!startDate && !endDate}
            className="font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.22em] text-[var(--ink-text-soft)] transition-colors duration-200 hover:text-[var(--ink-ivory)] disabled:cursor-not-allowed disabled:text-[var(--ink-dim)]"
          >
            Effacer
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={!hasRange}
            className="ml-auto border border-[var(--ink-ivory)] bg-[var(--ink-ivory)] px-7 py-3 font-[family:var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-[0.3em] text-[var(--ink-onyx)] transition-colors duration-200 disabled:cursor-not-allowed disabled:border-[var(--ink-line-soft)] disabled:bg-transparent disabled:text-[var(--ink-muted)]"
          >
            Valider
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cal-modal-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes cal-modal-in {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cal-modal-up {
          from { opacity: 0; transform: translateY(100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-label="Choisir les dates"] *[class*="cal-modal-"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
