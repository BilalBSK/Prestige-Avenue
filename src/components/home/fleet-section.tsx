import Link from "next/link";
import { Car } from "@prisma/client";
import { CarCard } from "@/components/cars/car-card";
import { SectionCounter } from "./section-counter";
import { FleetReveal } from "./fleet-reveal";

interface FleetSectionProps {
  cars: Car[];
}

export function FleetSection({ cars }: FleetSectionProps) {
  return (
    <section className="fleet py-32 md:py-40">
      <div className="lux-container">
        <header className="mb-12 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <SectionCounter index={3} className="mb-5" />
            <h2 className="font-[family:var(--font-fraunces)] text-[clamp(40px,5vw,56px)] font-light leading-none tracking-[-0.025em] text-[var(--ink-ivory)]">
              La flotte, <em className="italic font-normal">pièce par pièce.</em>
            </h2>
          </div>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 border-b border-[var(--ink-ivory)] pb-1 font-[family:var(--font-dm-sans)] text-[13px] text-[var(--ink-ivory)] transition-opacity duration-200 hover:opacity-80"
          >
            Voir le catalogue <span className="font-[family:var(--font-fraunces)] italic">→</span>
          </Link>
        </header>

        <FleetReveal>
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </FleetReveal>
      </div>
    </section>
  );
}
