import { SectionCounter } from "./section-counter";
import { ProcessReveal } from "./process-reveal";

const STEPS = [
  {
    num: "01",
    name: "Choisir",
    desc: "Parcourez la flotte. Chaque véhicule est décrit, photographié, contrôlé.",
  },
  {
    num: "02",
    name: "Réserver",
    desc: "Soumettez votre demande en moins d'une minute. Notre équipe la valide sous 24 h ouvrées.",
  },
  {
    num: "03",
    name: "Prendre la route",
    desc: "Règlement à la remise des clés à Rouen. Assurance, assistance, et tout le reste — inclus.",
  },
];

export function ProcessSection() {
  return (
    <section id="processus" className="process py-32 md:py-40">
      <div className="lux-container">
        <SectionCounter index={4} className="mb-5" />
        <h2 className="mb-14 max-w-[680px] font-[family:var(--font-fraunces)] text-[clamp(40px,5vw,56px)] font-light leading-none tracking-[-0.025em] text-[var(--ink-ivory)]">
          Trois gestes, <em className="italic font-normal">une seule clé.</em>
        </h2>

        <ProcessReveal>
          <span
            aria-hidden
            className="reveal-line absolute inset-x-0 top-0 hidden h-px bg-[var(--ink-line-soft)] md:block"
          />
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`process-step relative pr-7 pt-7 md:pt-9 ${
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
        </ProcessReveal>
      </div>
    </section>
  );
}
