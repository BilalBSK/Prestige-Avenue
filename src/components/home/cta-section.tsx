import Link from "next/link";
import { SectionCounter } from "./section-counter";
import { CtaArrow } from "./cta-arrow";
import { CtaReveal } from "./cta-reveal";

export function CtaSection() {
  return (
    <section id="reserver" className="cta-final py-40 text-center md:py-48">
      <div className="lux-container">
        <CtaReveal>
          <div className="mb-7 flex justify-center">
            <SectionCounter index={6} />
          </div>
          <h2 className="mx-auto max-w-[920px] font-[family:var(--font-fraunces)] text-[clamp(54px,7vw,86px)] font-light leading-none tracking-[-0.035em] text-[var(--ink-ivory)]">
            Choisissez
            <br />
            le <em className="italic font-normal">vôtre.</em>
          </h2>
          <Link
            href="/cars"
            className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[var(--ink-ivory)] px-8 py-[18px] font-[family:var(--font-dm-sans)] text-[14px] font-medium text-[var(--ink-onyx)] transition-colors duration-[250ms] hover:bg-[var(--ink-text)]"
          >
            <span>Voir le catalogue</span>
            <CtaArrow />
          </Link>
        </CtaReveal>
      </div>
    </section>
  );
}
