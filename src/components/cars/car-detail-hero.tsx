import Image from "next/image";
import Link from "next/link";
import { CarHeroCta } from "./car-hero-cta";

interface CarDetailHeroProps {
  brand: string;
  model: string;
  trim: string | null;
  mainImage: string;
  pricePerDay: number;
  pricePerKm: number | null;
}

export function CarDetailHero({ brand, model, trim, mainImage, pricePerDay, pricePerKm }: CarDetailHeroProps) {
  return (
    <section className="relative isolate -mt-20 h-[88vh] min-h-[640px] overflow-hidden md:-mt-24">
      <div className="car-hero-zoom absolute inset-0">
        <Image
          src={mainImage}
          alt={`${brand} ${model}`}
          fill
          priority
          quality={85}
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.55)_0%,rgba(5,5,5,0.25)_45%,rgba(5,5,5,0.95)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-overlay opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
        }}
      />

      <div className="lux-container relative z-10 flex h-full flex-col">
        <Link
          href="/cars"
          className="hero-cta-1 mt-[120px] inline-flex w-fit items-center gap-2 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-text-soft)] transition-colors duration-200 hover:text-[var(--ink-ivory)] md:mt-[140px]"
        >
          <span className="font-[family:var(--font-fraunces)] not-italic text-[16px] tracking-normal">
            ←
          </span>
          Catalogue
        </Link>

        <div className="mt-auto pb-[64px] md:pb-[96px]">
          <p className="hero-marker mb-3 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            <span className="mr-3 inline-block h-px w-8 bg-[var(--ink-dim)] align-middle" />
            {brand}
          </p>

          <h1 className="hero-lede1 max-w-full font-[family:var(--font-fraunces)] text-[clamp(44px,7.6vw,104px)] font-light leading-[0.94] tracking-[-0.035em] text-[var(--ink-ivory)]">
            {brand} <em className="font-normal italic">{model}.</em>
          </h1>
          {trim && (
            <p className="hero-lede2 mt-4 font-[family:var(--font-dm-sans)] text-[12px] uppercase tracking-[0.28em] text-[var(--ink-text-soft)] md:text-[13px]">
              {trim}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6 md:mt-12">
            <CarHeroCta />
            <div className="hero-marker text-right">
              <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
                À partir de
              </p>
              <p className="mt-1 font-[family:var(--font-fraunces)] text-[clamp(28px,3.4vw,40px)] font-light leading-none tracking-[-0.02em] text-[var(--ink-ivory)]">
                {pricePerDay.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="ml-1 font-[family:var(--font-dm-sans)] text-[12px] font-normal text-[var(--ink-text-soft)]">
                  €/jour
                </span>
              </p>
              {pricePerKm !== null && (
                <p className="mt-2 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.22em] text-[var(--ink-text-soft)]">
                  + {pricePerKm.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / km
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <span id="reserve-bar-show" aria-hidden className="pointer-events-none absolute bottom-0 h-px w-full" />

      <style>{`
        .car-hero-zoom {
          animation: car-hero-ken-burns 18s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes car-hero-ken-burns {
          from { transform: scale(1.0); }
          to { transform: scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .car-hero-zoom { animation: none; }
        }
      `}</style>
    </section>
  );
}
