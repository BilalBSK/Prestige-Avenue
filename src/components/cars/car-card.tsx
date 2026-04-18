import { Car } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

interface CarCardProps {
  car: Car;
}

function CarCardComponent({ car }: CarCardProps) {
  return (
    <Link href={`/cars/${car.id}`} className="group block">
      <article className="lux-panel car-card-luxury group relative overflow-hidden">
        {/* Image container with parallax effect */}
        <div className="relative h-72 w-full overflow-hidden bg-zinc-950">
          <div className="car-image-wrapper">
            <Image
              src={car.mainImage}
              alt={`${car.brand} ${car.model}`}
              fill
              className="car-image object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              loading="lazy"
              quality={85}
            />
          </div>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 transition-opacity duration-700 group-hover:opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/30" />

          {/* Year badge - floating top right */}
          <div className="car-year-badge absolute right-4 top-4 z-10">
            <div className="car-badge-glass rounded-lg border border-white/10 bg-black/80 px-3 py-1.5">
              <span className="block text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">
                Modèle
              </span>
              <span className="block text-sm font-semibold tabular-nums text-white">
                {car.year}
              </span>
            </div>
          </div>

          {/* Accent line - futuristic light */}
          <div className="car-accent-line absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-white via-zinc-400 to-transparent transition-all duration-700 group-hover:w-full" />
        </div>

        {/* Content section with staggered reveals */}
        <div className="relative space-y-4 p-6 pb-7">
          {/* Brand & Model */}
          <div className="space-y-2">
            <h3 className="car-title text-2xl font-[family:var(--font-display)] leading-tight text-white transition-colors duration-500 group-hover:text-zinc-100 lg:text-3xl">
              {car.brand}
            </h3>
            <p className="car-model text-base font-light tracking-wide text-zinc-400 transition-all duration-500 group-hover:text-zinc-300">
              {car.model}
              {car.trim ? ` — ${car.trim}` : ""}
            </p>
            {car.shortTagline && (
              <p className="text-xs font-light text-zinc-500 transition-colors duration-500 group-hover:text-zinc-400">
                {car.shortTagline}
              </p>
            )}
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              {car.power} ch
            </p>
          </div>

          {/* Divider with expand effect */}
          <div className="car-divider-container flex items-center gap-3">
            <div className="car-divider h-px w-12 bg-gradient-to-r from-zinc-700 to-transparent transition-all duration-700 group-hover:w-20 group-hover:from-white" />
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-600 transition-colors duration-500 group-hover:text-zinc-400">
              Prestige
            </span>
          </div>

          {/* Price section - elevated design */}
          <div className="car-price-section flex items-end justify-between pt-2">
            <div className="car-price-info space-y-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
                À partir de
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="car-price-amount text-3xl font-[family:var(--font-display)] font-semibold tabular-nums text-white transition-transform duration-500 group-hover:scale-105">
                  {Number(car.pricePerDay).toFixed(0)}
                </span>
                <span className="text-sm font-light text-zinc-400">EUR</span>
              </div>
              <p className="text-xs font-light text-zinc-500">par jour</p>
            </div>

            {/* CTA Arrow */}
            <div className="car-cta-arrow flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/90 transition-all duration-500 group-hover:border-zinc-600 group-hover:bg-zinc-800">
              <svg
                className="h-4 w-4 text-zinc-400 transition-all duration-500 group-hover:translate-x-0.5 group-hover:text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Availability indicator */}
          <div className="car-availability flex items-center gap-2 pt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <span className="text-xs font-light text-zinc-600 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
              Disponible
            </span>
          </div>
        </div>

        {/* Hover overlay effect */}
        <div className="car-hover-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 via-transparent to-transparent" />
        </div>
      </article>
    </Link>
  );
}

// Memoize to prevent unnecessary re-renders when car data hasn't changed
export const CarCard = memo(CarCardComponent);
