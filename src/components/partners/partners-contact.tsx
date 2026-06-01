import { CtaArrow } from "@/components/home/cta-arrow";
import { CtaReveal } from "@/components/home/cta-reveal";
import { ClockIcon } from "@/components/contact/contact-icons";

const PHONE_DISPLAY = "06 21 18 94 82";
const PHONE_TEL = "+33621189482";
const HOURS = "Lundi → Samedi · 9h — 19h";

export function PartnersContact() {
  return (
    <section className="relative isolate overflow-hidden border-y border-[var(--ink-line)] bg-[var(--ink-onyx)] py-24 md:py-32">
      {/* Grain — cohérent avec les héros du site. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
        }}
      />
      {/* Halo atmosphérique, monochrome. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.05),transparent_72%)] blur-2xl"
      />

      <div className="lux-container relative z-10">
        <CtaReveal>
          <div className="relative mx-auto max-w-[600px] overflow-hidden border border-[var(--ink-line)] bg-[var(--ink-elevated)] px-6 py-14 text-center md:px-16 md:py-[72px]">
            {/* Arête supérieure « éclairée » — détail premium, monochrome. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]"
            />

            <p className="lux-eyebrow inline-block font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.32em]">
              — Contact partenariats
            </p>

            <p className="mx-auto mt-5 max-w-[340px] font-[family:var(--font-dm-sans)] text-[14px] leading-[1.7] text-[var(--ink-text-soft)]">
              Un projet de collaboration ? Parlons-en directement, de vive voix.
            </p>

            <a
              href={`tel:${PHONE_TEL}`}
              aria-label={`Appeler le ${PHONE_DISPLAY}`}
              className="group/phone mt-9 inline-block focus:outline-none"
            >
              <span className="block whitespace-nowrap font-[family:var(--font-fraunces)] text-[clamp(30px,8vw,56px)] font-light leading-none tracking-[-0.02em] text-[var(--ink-ivory)] transition-opacity duration-300 group-hover/phone:opacity-90">
                {PHONE_DISPLAY}
              </span>
              {/* Hairline or : visible au repos (effet bijou), s'étend au survol/focus. */}
              <span
                aria-hidden
                className="mx-auto mt-4 block h-px w-12 bg-[linear-gradient(90deg,var(--gold-deep),var(--gold-soft),var(--gold-deep))] transition-[width] duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/phone:w-[clamp(180px,40%,260px)] group-focus-visible/phone:w-[clamp(180px,40%,260px)]"
              />
            </a>

            <div className="mt-10">
              <a
                href={`tel:${PHONE_TEL}`}
                className="group inline-flex items-center gap-3 rounded-full bg-[var(--ink-ivory)] px-8 py-[18px] font-[family:var(--font-dm-sans)] text-[14px] font-medium text-[var(--ink-onyx)] transition-colors duration-[250ms] hover:bg-[var(--ink-text)]"
              >
                <span>Appeler maintenant</span>
                <CtaArrow />
              </a>
            </div>

            <p className="mt-9 flex items-center justify-center gap-2 font-[family:var(--font-dm-sans)] text-[12px] tracking-[0.02em] text-[var(--ink-muted)]">
              <ClockIcon className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{HOURS}</span>
            </p>
          </div>
        </CtaReveal>
      </div>
    </section>
  );
}
