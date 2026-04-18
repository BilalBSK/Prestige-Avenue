import { CarCard } from "@/components/cars/car-card";
import { AnimatedText, GlitchText } from "@/components/ui/animated-text";
import { getCars } from "@/services/car.service";

interface CarsPageProps {
  searchParams: Promise<{
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const params = await searchParams;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const cars = await getCars({
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
  });

  return (
    <div className="lux-container space-y-8 py-12">
      <div className="space-y-3">
        <h1 className="text-4xl font-[family:var(--font-display)] text-white md:text-5xl">
          <GlitchText text="Collection" className="inline-block" />{" "}
          <AnimatedText
            text="Prestige Avenue"
            as="span"
            animation="light-sweep"
            className="inline-block"
          />
        </h1>
        <AnimatedText
          text="Selectionnez un modele, ajustez votre budget journalier puis finalisez votre reservation."
          as="p"
          animation="expand"
          delay={200}
          className="max-w-2xl text-zinc-400"
        />
      </div>

      <form className="lux-panel lux-card-soft grid gap-3 p-5 md:grid-cols-3">
        <input
          type="number"
          name="minPrice"
          min={0}
          defaultValue={params.minPrice ?? ""}
          placeholder="Prix min / jour"
          className="lux-input"
        />
        <input
          type="number"
          name="maxPrice"
          min={0}
          defaultValue={params.maxPrice ?? ""}
          placeholder="Prix max / jour"
          className="lux-input"
        />
        <button type="submit" className="lux-btn-primary w-full">
          Filtrer
        </button>
      </form>

      {cars.length === 0 ? (
        <div className="lux-panel p-6 text-zinc-300">
          Aucun vehicule disponible pour ces filtres.
        </div>
      ) : (
        <div className="lux-stagger grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
