"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { SectionCounter } from "@/components/home/section-counter";

interface CarTitleBlockProps {
  brand: string;
  model: string;
  trim: string | null;
  shortTagline: string | null;
  description: string;
  index: number;
  total: number;
}

export function CarTitleBlock({
  brand,
  model,
  trim,
  shortTagline,
  description,
  index,
  total,
}: CarTitleBlockProps) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.2 });
  return (
    <section className="lux-container py-32 md:py-40">
      <div ref={ref} className="reveal-fade-up max-w-[920px]">
        <SectionCounter index={index} total={total} className="mb-6" />
        <h2 className="font-[family:var(--font-fraunces)] text-[clamp(40px,5vw,68px)] font-light leading-[1] tracking-[-0.025em] text-[var(--ink-ivory)]">
          Le modèle, <em className="italic font-normal">en détail.</em>
        </h2>
        {shortTagline && (
          <p className="mt-8 max-w-[780px] font-[family:var(--font-fraunces)] text-[clamp(20px,2.4vw,28px)] font-light leading-[1.35] italic text-[var(--ink-text)]">
            {shortTagline}
          </p>
        )}
        <p className="mt-7 max-w-[680px] font-[family:var(--font-dm-sans)] text-[15px] leading-[1.7] text-[var(--ink-text-soft)]">
          {description}
        </p>
        <div className="mt-10 inline-flex items-center gap-3 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
          <span className="inline-block h-px w-8 bg-[var(--ink-dim)]" />
          {brand} {model}{trim ? ` · ${trim}` : ""}
        </div>
      </div>
    </section>
  );
}
