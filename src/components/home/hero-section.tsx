import Link from "next/link";
import { HeroVideo } from "@/components/hero/hero-video";

export function HeroSection() {
  return (
    <section className="relative isolate -mt-20 min-h-[100svh] overflow-hidden md:-mt-24">
      <HeroVideo />

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(0,0,0,0.6)_75%,rgba(5,5,5,0.95)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
        }}
      />

      <div className="lux-container relative z-10 grid min-h-[100svh] items-end pb-[80px] pt-[120px] md:pb-[100px]">
        <div className="max-w-[920px]">
          <h1 className="hero-title font-[family:var(--font-fraunces)] text-[clamp(50px,7.5vw,96px)] font-light leading-[0.94] tracking-[-0.035em] text-[var(--ink-ivory)]">
            <span className="hero-word block overflow-hidden">
              <span className="hero-word-inner block">Prestige</span>
            </span>
            <span className="hero-word block overflow-hidden">
              <span className="hero-word-inner hero-word-2 block italic font-normal">Avenue.</span>
            </span>
          </h1>

          <p className="hero-lede1 mt-7 max-w-[600px] font-[family:var(--font-fraunces)] text-[22px] font-light leading-[1.45] text-[var(--ink-text)]">
            Réservez aujourd&apos;hui le véhicule qui vous ressemble, le prestige devient accessible.
          </p>
          <p className="hero-lede2 mt-3 max-w-[540px] font-[family:var(--font-dm-sans)] text-[14px] leading-[1.55] text-[var(--ink-text-soft)]">
            Véhicules contrôlés, assurance incluse et assistance dédiée. Profitez de la route, on s&apos;occupe du reste.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/cars"
              className="hero-cta-1 inline-flex items-center justify-center rounded-full border border-[var(--ink-ivory)] bg-[var(--ink-ivory)] px-7 py-[13px] font-[family:var(--font-dm-sans)] text-[13px] font-medium text-[var(--ink-onyx)] transition-[background-color,color] duration-[350ms] ease-out hover:bg-transparent hover:text-[var(--ink-ivory)]"
            >
              Voir le catalogue
            </Link>
            <Link
              href="#a-savoir"
              className="hero-cta-2 inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-[13px] font-[family:var(--font-dm-sans)] text-[13px] font-medium text-[var(--ink-ivory)] transition-[border-color] duration-[350ms] ease-out hover:border-[var(--ink-ivory)]"
            >
              À savoir
            </Link>
          </div>
        </div>

        <span
          aria-hidden
          className="hero-marker pointer-events-none absolute bottom-[80px] right-6 inline-flex items-center gap-[10px] font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-muted)] md:bottom-[100px] md:right-9"
        >
          <span className="inline-block h-px w-8 bg-[var(--ink-dim)]" />
          2026
        </span>
      </div>
    </section>
  );
}
