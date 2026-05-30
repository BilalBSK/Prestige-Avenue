"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

const TYPES = [
  {
    title: "Visibilité croisée",
    body: "On se met en avant, mutuellement. Votre audience, notre présence.",
  },
  {
    title: "Contenu",
    body: "Shootings, vidéos, collabs. Nos voitures, votre talent.",
  },
  {
    title: "Commissions",
    body: "Chaque location apportée vous rémunère. Simple et transparent.",
  },
  {
    title: "Événementiel",
    body: "Mariages, tournages, séminaires. Une offre taillée pour l'occasion.",
  },
];

export function PartnersTypes() {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section className="border-y border-[var(--ink-line)] bg-[var(--ink-onyx)] py-20 md:py-28">
      <div className="lux-container">
        <div className="mb-10 max-w-[680px] md:mb-12">
          <p className="lux-eyebrow mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em]">
            — Formes de collaboration
          </p>
          <h2 className="font-[family:var(--font-fraunces)] text-[clamp(32px,4vw,52px)] font-light leading-[1] tracking-[-0.025em] text-[var(--ink-ivory)]">
            Plusieurs façons de{" "}
            <em className="italic font-normal">travailler ensemble.</em>
          </h2>
        </div>

        <div ref={ref} className="reveal-stagger grid gap-px bg-[var(--ink-line)] md:grid-cols-2">
          {TYPES.map((type, i) => (
            <article
              key={type.title}
              className="group relative flex flex-col gap-3 bg-[var(--ink-onyx)] px-7 py-8 transition-colors duration-[350ms] ease-out hover:bg-[var(--ink-surface)] md:px-9 md:py-10"
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-[family:var(--font-fraunces)] text-[22px] font-light leading-[1.2] tracking-[-0.01em] text-[var(--ink-ivory)] md:text-[26px]">
                  {type.title}
                </h3>
                <span className="font-[family:var(--font-fraunces)] text-[14px] italic text-[var(--ink-dim)] transition-colors duration-300 group-hover:text-[var(--ink-text-soft)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="font-[family:var(--font-dm-sans)] text-[14px] leading-[1.7] text-[var(--ink-text-soft)]">
                {type.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
