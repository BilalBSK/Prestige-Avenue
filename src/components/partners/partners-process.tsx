"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

const STEPS = [
  {
    num: "01",
    name: "Contact",
    desc: "Quelques lignes sur votre projet suffisent.",
  },
  {
    num: "02",
    name: "Cadre",
    desc: "On définit ensemble les modalités. Clair, équitable.",
  },
  {
    num: "03",
    name: "Lancement",
    desc: "Le partenariat démarre. On ajuste en route.",
  },
];

export function PartnersProcess() {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="bg-[var(--ink-surface)] py-20 md:py-28">
      <div className="lux-container">
        <p className="lux-eyebrow mb-5 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em]">
          — Comment démarrer
        </p>
        <h2 className="mb-12 max-w-[680px] font-[family:var(--font-fraunces)] text-[clamp(32px,4vw,52px)] font-light leading-none tracking-[-0.025em] text-[var(--ink-ivory)]">
          Trois étapes, <em className="italic font-normal">aucune friction.</em>
        </h2>

        <div ref={ref} className="reveal-stagger relative grid gap-px md:grid-cols-3">
          <span
            aria-hidden
            className="reveal-line absolute inset-x-0 top-0 hidden h-px bg-[var(--ink-line-soft)] md:block"
          />
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`relative pr-7 pt-7 md:pt-9 ${
                i > 0
                  ? "border-t border-[var(--ink-line)] md:border-l md:border-t-0 md:pl-7"
                  : "md:pr-7"
              }`}
            >
              <div className="font-[family:var(--font-fraunces)] text-[56px] font-light italic leading-none tracking-[-0.02em] text-[var(--ink-ivory)]">
                {step.num}
              </div>
              <div className="mt-5 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
                {step.name}
              </div>
              <p className="mt-3.5 max-w-[280px] font-[family:var(--font-dm-sans)] text-[14px] leading-[1.6] text-[var(--ink-text-soft)]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
