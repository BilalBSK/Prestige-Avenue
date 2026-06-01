import { Car } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

interface CarCardProps {
  car: Car;
  gleamPrice?: boolean;
}

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function CarCardComponent({ car, gleamPrice = false }: CarCardProps) {
  const trim = car.trim?.trim() || null;
  const price = priceFormatter.format(Number(car.pricePerDay));
  const pricePerKm =
    car.pricePerKm !== null && car.pricePerKm !== undefined
      ? priceFormatter.format(Number(car.pricePerKm))
      : null;

  return (
    <Link
      href={`/cars/${car.id}`}
      className="car-card group block overflow-hidden rounded-lg border border-[var(--ink-line)] bg-[var(--ink-surface)] transition-[border-color] duration-[350ms] ease-out hover:border-[var(--ink-dim)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--ink-elevated)]">
        <Image
          src={car.mainImage}
          alt={`${car.brand} ${car.model}${trim ? ` ${trim}` : ""}`}
          fill
          className="car-card-image object-cover transition-transform duration-[700ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, 33vw"
          loading="lazy"
          quality={85}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      <div className="px-[22px] pb-[26px] pt-[22px]">
        <h3 className="font-[family:var(--font-fraunces)] text-[28px] font-light leading-none tracking-[-0.015em] text-[var(--ink-ivory)] transition-transform duration-[350ms] ease-out group-hover:translate-x-[2px]">
          {car.brand} <em className="font-normal italic">{car.model}</em>
        </h3>
        <p className="mt-[8px] font-[family:var(--font-dm-sans)] text-[12px] uppercase tracking-[0.18em] text-[var(--ink-text-soft)]">
          {trim ? `${trim} · ` : ""}
          {car.power} ch
        </p>

        <div className="mt-7 flex items-end justify-between border-t border-[var(--ink-line)] pt-[18px]">
          <div>
            <p
              className={`font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.06em] ${
                gleamPrice ? "lux-eyebrow" : "text-[var(--ink-soft)]"
              }`}
            >
              À partir de
            </p>
            <p className="mt-1 font-[family:var(--font-fraunces)] text-[30px] font-light leading-none tracking-[-0.015em] text-[var(--ink-ivory)]">
              {price}
              <span className="ml-1 font-[family:var(--font-dm-sans)] text-[12px] font-normal text-[var(--ink-soft)]">
                €/jour
              </span>
            </p>
            {pricePerKm && (
              <p className="mt-2 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.18em] text-[var(--ink-text-soft)]">
                + {pricePerKm} €/km
              </p>
            )}
          </div>
          <span
            aria-hidden
            className="gold-glyph font-[family:var(--font-fraunces)] text-[18px] italic transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[4px]"
          >
            →
          </span>
        </div>
      </div>
    </Link>
  );
}

export const CarCard = memo(CarCardComponent);
