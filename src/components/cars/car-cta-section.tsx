"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { useBookingSheet } from "./booking-sheet-provider";

interface CarCtaSectionProps {
  brand: string;
  model: string;
  pricePerDay: number;
  pricePerKm: number | null;
}

export function CarCtaSection({ brand, model, pricePerDay, pricePerKm }: CarCtaSectionProps) {
  const { openSheet } = useBookingSheet();
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section
      id="reserve-bar-hide"
      className="relative isolate overflow-hidden border-t border-[var(--ink-line)] bg-[var(--ink-onyx)] py-32 md:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-px left-1/2 h-[1px] w-[200px] -translate-x-1/2 bg-[var(--ink-line-soft)]"
      />

      <div
        ref={ref}
        className="reveal-fade-up lux-container relative z-10 flex flex-col items-center text-center"
      >
        <p className="mb-6 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
          <span className="mr-3 inline-block h-px w-8 bg-[var(--ink-dim)] align-middle" />
          Réservation
        </p>
        <h2 className="max-w-[860px] font-[family:var(--font-fraunces)] text-[clamp(40px,6vw,84px)] font-light leading-[0.95] tracking-[-0.03em] text-[var(--ink-ivory)]">
          Prenez la route avec
          <br />
          <em className="italic font-normal">
            {brand} {model}.
          </em>
        </h2>
        <p className="mt-8 max-w-[520px] font-[family:var(--font-dm-sans)] text-[14px] leading-[1.7] text-[var(--ink-text-soft)]">
          Réservez en moins d&apos;une minute. Notre équipe valide la demande
          sous 24 h ouvrées et organise la remise.
        </p>

        <button
          type="button"
          onClick={openSheet}
          className="group mt-12 inline-flex items-center gap-5 border border-[var(--ink-ivory)] bg-[var(--ink-ivory)] px-9 py-4 transition-[transform,box-shadow] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[0_24px_60px_-30px_rgba(255,255,255,0.4)]"
        >
          <span className="font-[family:var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-[0.3em] text-[var(--ink-onyx)]">
            Réserver cette voiture
          </span>
          <span className="relative h-[14px] w-[14px] overflow-hidden">
            <span className="cta-arrow-track absolute inset-0 flex flex-col transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)]">
              <span className="flex h-[14px] items-center justify-center font-[family:var(--font-fraunces)] text-[16px] not-italic text-[var(--ink-onyx)]">
                →
              </span>
              <span className="flex h-[14px] items-center justify-center font-[family:var(--font-fraunces)] text-[16px] not-italic text-[var(--ink-onyx)]">
                →
              </span>
            </span>
          </span>
        </button>

        <p className="mt-10 font-[family:var(--font-fraunces)] text-[14px] italic text-[var(--ink-text-soft)]">
          À partir de{" "}
          <span className="not-italic font-normal text-[var(--ink-ivory)]">
            {pricePerDay.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </span>{" "}
          / jour
          {pricePerKm !== null && (
            <>
              {" "}+{" "}
              <span className="not-italic font-normal text-[var(--ink-ivory)]">
                {pricePerKm.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>{" "}
              / km
            </>
          )}
          {" "}— sans paiement en ligne.
        </p>
      </div>
    </section>
  );
}
