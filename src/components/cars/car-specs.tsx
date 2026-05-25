"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { SectionCounter } from "@/components/home/section-counter";
import type { FuelType, Transmission } from "@prisma/client";

const TRANSMISSION_LABEL: Record<Transmission, string> = {
  AUTOMATIC: "Automatique",
  MANUAL: "Manuelle",
};

const FUEL_LABEL: Record<FuelType, string> = {
  PETROL: "Essence",
  DIESEL: "Diesel",
  HYBRID: "Hybride",
  PLUG_IN_HYBRID: "Hybride rechargeable",
  ELECTRIC: "Électrique",
};

interface CarSpecsProps {
  power: number;
  transmission: Transmission;
  fuelType: FuelType;
  seats: number;
  doors: number;
  year: number;
  index: number;
  total: number;
}

interface SpecCellProps {
  label: string;
  value: string;
  unit?: string;
  variant: "numeric" | "text";
}

function SpecCell({ label, value, unit, variant }: SpecCellProps) {
  const sizeClass =
    variant === "numeric"
      ? "text-[clamp(44px,5vw,72px)] font-light leading-[0.95] tracking-[-0.025em]"
      : "text-[clamp(22px,2.4vw,32px)] font-normal italic leading-[1.05] tracking-[-0.01em]";

  return (
    <div className="group relative flex flex-col items-start py-10 md:py-14 md:pl-10 first:md:pl-0 md:[&:not(:first-child)]:border-l md:border-[var(--ink-line)]">
      <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)] transition-colors duration-300 group-hover:text-[var(--ink-text-soft)]">
        {label}
      </p>
      <p
        className={`spec-value mt-5 max-w-full break-words font-[family:var(--font-fraunces)] text-[var(--ink-ivory)] ${sizeClass}`}
      >
        {value}
        {unit && (
          <span className="ml-1.5 align-middle font-[family:var(--font-dm-sans)] text-[12px] font-normal not-italic uppercase tracking-[0.18em] text-[var(--ink-text-soft)]">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}

export function CarSpecs({
  power,
  transmission,
  fuelType,
  seats,
  doors,
  year,
  index,
  total,
}: CarSpecsProps) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });
  return (
    <section className="border-y border-[var(--ink-line)] bg-[var(--ink-surface)] py-24 md:py-32">
      <div className="lux-container">
        <div className="mb-12 flex items-end justify-between md:mb-16">
          <div>
            <SectionCounter index={index} total={total} className="mb-4" />
            <h2 className="font-[family:var(--font-fraunces)] text-[clamp(32px,4vw,52px)] font-light leading-[1] tracking-[-0.025em] text-[var(--ink-ivory)]">
              La fiche, <em className="italic font-normal">en chiffres.</em>
            </h2>
          </div>
        </div>
        <div
          ref={ref}
          className="reveal-stagger grid grid-cols-2 gap-x-8 gap-y-2 md:grid-cols-4 md:gap-x-0"
        >
          <SpecCell label="Puissance" value={String(power)} unit="ch" variant="numeric" />
          <SpecCell
            label="Transmission"
            value={TRANSMISSION_LABEL[transmission]}
            variant="text"
          />
          <SpecCell label="Carburant" value={FUEL_LABEL[fuelType]} variant="text" />
          <SpecCell label="Année" value={String(year)} variant="numeric" />
          <SpecCell label="Places" value={String(seats)} unit="pers." variant="numeric" />
          <SpecCell label="Portes" value={String(doors)} unit="ptes" variant="numeric" />
        </div>
      </div>
    </section>
  );
}
