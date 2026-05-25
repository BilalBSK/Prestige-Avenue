"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

interface Feature {
  title: string;
  body: string;
}

interface CarFeaturesProps {
  features: Feature[];
}

export function CarFeatures({ features }: CarFeaturesProps) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });
  if (features.length === 0) return null;

  return (
    <section className="border-y border-[var(--ink-line)] bg-[var(--ink-surface)] py-24 md:py-32">
      <div className="lux-container">
        <div className="mb-12 max-w-[820px] md:mb-16">
          <p className="mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            — Détails techniques
          </p>
          <h3 className="font-[family:var(--font-fraunces)] text-[clamp(32px,4vw,52px)] font-light leading-[1] tracking-[-0.025em] text-[var(--ink-ivory)]">
            Sous le <em className="italic font-normal">capot.</em>
          </h3>
        </div>
        <div ref={ref} className="reveal-stagger grid gap-x-12 gap-y-px md:grid-cols-2">
          {features.map((feature, i) => (
            <article
              key={`${feature.title}-${i}`}
              className="group flex flex-col gap-3 border-t border-[var(--ink-line)] py-9"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-[family:var(--font-fraunces)] text-[22px] font-light leading-[1.2] tracking-[-0.01em] text-[var(--ink-ivory)]">
                  {feature.title}
                </h4>
                <span className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="font-[family:var(--font-dm-sans)] text-[14px] leading-[1.7] text-[var(--ink-text-soft)]">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
