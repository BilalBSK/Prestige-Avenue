"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

interface CarHighlightsProps {
  highlights: string[];
}

export function CarHighlights({ highlights }: CarHighlightsProps) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.2 });
  if (highlights.length === 0) return null;

  return (
    <section className="lux-container py-24 md:py-32">
      <div className="mb-10 max-w-[680px]">
        <p className="mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
          — Sélection
        </p>
        <h3 className="font-[family:var(--font-fraunces)] text-[clamp(28px,3.5vw,44px)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--ink-ivory)]">
          Ce qui la rend <em className="italic font-normal">remarquable.</em>
        </h3>
      </div>
      <div ref={ref} className="reveal-stagger grid gap-px bg-[var(--ink-line)] md:grid-cols-2">
        {highlights.map((item, i) => (
          <div
            key={`${item}-${i}`}
            className="group relative flex items-center gap-6 bg-[var(--ink-onyx)] px-7 py-7 transition-colors duration-[350ms] ease-out hover:bg-[var(--ink-surface)]"
          >
            <span className="font-[family:var(--font-fraunces)] text-[14px] italic text-[var(--ink-dim)] transition-colors duration-300 group-hover:text-[var(--ink-text-soft)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p className="flex-1 font-[family:var(--font-fraunces)] text-[18px] font-light leading-[1.4] text-[var(--ink-text)]">
              {item}
            </p>
            <span
              aria-hidden
              className="font-[family:var(--font-fraunces)] text-[18px] italic text-[var(--ink-dim)] opacity-0 transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:opacity-100"
            >
              →
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
