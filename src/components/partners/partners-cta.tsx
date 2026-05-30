import Link from "next/link";
import { CtaArrow } from "@/components/home/cta-arrow";
import { CtaReveal } from "@/components/home/cta-reveal";
import { SOCIALS } from "@/components/social/socials";

export function PartnersCta() {
  return (
    <section className="cta-final border-t border-[var(--ink-line)] py-28 text-center md:py-36">
      <div className="lux-container">
        <CtaReveal>
          <p className="lux-eyebrow mb-7 inline-block font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em]">
            Une idée en tête ?
          </p>
          <h2 className="mx-auto max-w-[920px] font-[family:var(--font-fraunces)] text-[clamp(44px,6vw,80px)] font-light leading-[1] tracking-[-0.035em] text-[var(--ink-ivory)]">
            Devenons
            <br />
            <em className="italic font-normal">partenaires.</em>
          </h2>
          <Link
            href="/contact"
            className="group mt-10 inline-flex items-center gap-3 rounded-full bg-[var(--ink-ivory)] px-8 py-[18px] font-[family:var(--font-dm-sans)] text-[14px] font-medium text-[var(--ink-onyx)] transition-colors duration-[250ms] hover:bg-[var(--ink-text)]"
          >
            <span>Nous contacter</span>
            <CtaArrow />
          </Link>

          <div className="mt-16 flex flex-col items-center gap-6">
            <p className="lux-eyebrow font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em]">
              Suivez le mouvement
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {SOCIALS.map(({ label, handle, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${label} — @${handle}`}
                  className="group/social flex items-center gap-2.5 rounded-full border border-[var(--ink-line)] py-2.5 pl-2.5 pr-3 text-[var(--ink-text-soft)] transition-[color,border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--ink-text-soft)] hover:text-[var(--ink-ivory)]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ink-line)] transition-colors duration-300 group-hover/social:border-[var(--ink-text-soft)]">
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="font-[family:var(--font-dm-sans)] text-[12px] tracking-[0.02em]">
                    {label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </CtaReveal>
      </div>
    </section>
  );
}
