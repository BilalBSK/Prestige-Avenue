import { SectionCounter } from "@/components/home/section-counter";

interface CarsHeroProps {
  totalCount: number;
}

export function CarsHero({ totalCount }: CarsHeroProps) {
  const count = String(totalCount).padStart(2, "0");
  return (
    <section className="relative isolate -mt-20 flex min-h-[58vh] items-end overflow-hidden md:-mt-24 md:min-h-[62vh]">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.5)_0%,rgba(5,5,5,1)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
        }}
      />

      <div className="lux-container relative z-10 grid w-full pb-14 pt-[140px] md:pb-20 md:pt-[160px]">
        <div className="max-w-[920px]">
          <div className="hero-cta-1 mb-6">
            <SectionCounter index={1} total={2} />
          </div>
          <h1 className="hero-lede1 font-[family:var(--font-fraunces)] text-[clamp(48px,7vw,88px)] font-light leading-[0.96] tracking-[-0.035em] text-[var(--ink-ivory)]">
            Catalogue
            <br />
            <em className="font-normal italic">complet.</em>
          </h1>
          <p className="hero-lede2 mt-6 max-w-[580px] font-[family:var(--font-fraunces)] text-[19px] font-light leading-[1.45] text-[var(--ink-text)]">
            Sélection serrée. Mécaniques irréprochables. Choisissez la voiture, on s&apos;occupe du reste.
          </p>

          <div className="hero-marker mt-8 flex items-center gap-3 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            <span className="inline-block h-px w-8 bg-[var(--ink-dim)]" />
            {count} véhicules disponibles
          </div>
        </div>
      </div>
    </section>
  );
}
