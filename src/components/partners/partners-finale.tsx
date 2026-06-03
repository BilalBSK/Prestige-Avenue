"use client";

import Link from "next/link";
import { CtaArrow } from "@/components/home/cta-arrow";
import { CtaShaderBackdrop } from "@/components/home/cta-shader-backdrop";
import { ClockIcon } from "@/components/contact/contact-icons";
import { SOCIALS } from "@/components/social/socials";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

const PHONE_DISPLAY = "06 21 18 94 82";
const PHONE_TEL = "+33621189482";
const HOURS = "Lundi → Samedi · 9h — 19h";

/**
 * Closing section of the partners page. Fuses what used to be two stacked
 * blocks — the "Devenons partenaires" call-to-action and the standalone phone
 * card — into a single orchestrated finale over the brand's signature gold
 * shader backdrop. One narrative: become partners → reach us → follow us.
 *
 * The six direct children of `.reveal-stagger` are intentional: the utility
 * only animates nth-child(1…6) into view, so anything extra must stay nested.
 */
export function PartnersFinale() {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.12 });

  return (
    <section className="cta-final relative isolate overflow-hidden border-t border-[var(--ink-line)] bg-[var(--ink-onyx)] py-28 text-center md:py-40">
      <CtaShaderBackdrop />

      <div className="lux-container relative z-10">
        <div
          ref={ref}
          className="reveal-stagger mx-auto flex max-w-[780px] flex-col items-center"
        >
          {/* 1 — eyebrow */}
          <p className="lux-eyebrow font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em]">
            Une idée en tête ?
          </p>

          {/* 2 — emotional headline */}
          <h2 className="mt-6 font-[family:var(--font-fraunces)] text-[clamp(44px,6vw,80px)] font-light leading-[0.98] tracking-[-0.035em] text-[var(--ink-ivory)]">
            Devenons
            <br />
            <em className="italic font-normal">partenaires.</em>
          </h2>

          {/* 3 — lede that bridges the CTA into the contact intent */}
          <p className="mt-7 max-w-[440px] font-[family:var(--font-dm-sans)] text-[15px] leading-[1.7] text-[var(--ink-text-soft)]">
            Un projet de collaboration ? Parlons-en directement, de vive voix.
          </p>

          {/* 4 — phone, refined to a secondary scale with the signature
                  expanding gold hairline + opening hours */}
          <div className="mt-12 flex flex-col items-center">
            <span className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              Par téléphone
            </span>
            <a
              href={`tel:${PHONE_TEL}`}
              aria-label={`Appeler le ${PHONE_DISPLAY}`}
              className="group/phone mt-3.5 inline-block focus:outline-none"
            >
              <span className="block whitespace-nowrap font-[family:var(--font-fraunces)] text-[clamp(24px,3.4vw,36px)] font-light leading-none tracking-[-0.015em] text-[var(--ink-ivory)] transition-opacity duration-300 group-hover/phone:opacity-90">
                {PHONE_DISPLAY}
              </span>
              <span
                aria-hidden
                className="mx-auto mt-3 block h-px w-10 bg-[linear-gradient(90deg,var(--gold-deep),var(--gold-soft),var(--gold-deep))] transition-[width] duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/phone:w-[clamp(150px,60%,220px)] group-focus-visible/phone:w-[clamp(150px,60%,220px)]"
              />
            </a>
            <p className="mt-5 flex items-center justify-center gap-2 font-[family:var(--font-dm-sans)] text-[12px] tracking-[0.02em] text-[var(--ink-muted)]">
              <ClockIcon className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{HOURS}</span>
            </p>
          </div>

          {/* 5 — the two channels, balanced: call (primary) / write (secondary) */}
          <div className="mt-11 flex w-full flex-col items-center gap-3.5 sm:w-auto sm:flex-row sm:justify-center">
            <a
              href={`tel:${PHONE_TEL}`}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-[var(--ink-ivory)] px-8 py-[17px] font-[family:var(--font-dm-sans)] text-[14px] font-medium text-[var(--ink-onyx)] transition-colors duration-[250ms] hover:bg-[var(--ink-text)] sm:w-auto"
            >
              <span>Appeler maintenant</span>
              <CtaArrow />
            </a>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-full border border-[var(--ink-line-soft)] px-8 py-[17px] font-[family:var(--font-dm-sans)] text-[14px] font-medium text-[var(--ink-text-soft)] transition-[color,border-color] duration-[250ms] hover:border-[var(--ink-text-soft)] hover:text-[var(--ink-ivory)] sm:w-auto"
            >
              Nous écrire
            </Link>
          </div>

          {/* 6 — social cluster, closing the page (nested divider keeps the
                  stagger at exactly six direct children) */}
          <div className="mt-16 flex w-full flex-col items-center gap-6">
            <span aria-hidden className="gold-rule w-14" />
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
        </div>
      </div>
    </section>
  );
}
