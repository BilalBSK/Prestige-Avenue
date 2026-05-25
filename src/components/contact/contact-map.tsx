"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

interface ContactMapProps {
  embedSrc: string;
  city: string;
}

export function ContactMap({ embedSrc, city }: ContactMapProps) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.05 });

  return (
    <section className="relative isolate overflow-hidden border-t border-[var(--ink-line)] bg-[var(--ink-surface)] pb-16 pt-10 md:pb-24 md:pt-12">
      <div className="lux-container">
        <div
          ref={ref}
          className="contact-map-reveal relative aspect-[4/3] w-full overflow-hidden border border-[var(--ink-line)] md:aspect-[16/10]"
        >
          <iframe
            src={embedSrc}
            title={`Localisation Prestige Avenue — ${city}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="contact-map-frame absolute inset-0 h-full w-full border-0"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(5,5,5,0.4)_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--ink-line)]"
          />
        </div>
      </div>
    </section>
  );
}
