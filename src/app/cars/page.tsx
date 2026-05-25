import { CarCard } from "@/components/cars/car-card";
import { CarsEmptyState } from "@/components/cars/cars-empty-state";
import { CarsGrid } from "@/components/cars/cars-grid";
import { CarsHero } from "@/components/cars/cars-hero";
import { CarsToolbar } from "@/components/cars/cars-toolbar";
import {
  PRICE_MAX,
  PRICE_MIN,
  parseFiltersFromSearchParams,
} from "@/lib/cars/filters";
import { getAvailableBrands, getCars } from "@/services/car.service";

interface CarsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CarsPage({ searchParams }: CarsPageProps) {
  const params = await searchParams;
  const filters = parseFiltersFromSearchParams(params);

  const [cars, brands] = await Promise.all([
    getCars({
      minPrice: filters.minPrice === PRICE_MIN ? undefined : filters.minPrice,
      maxPrice: filters.maxPrice === PRICE_MAX ? undefined : filters.maxPrice,
      transmission: filters.transmission ?? undefined,
      fuelTypes: filters.fuelTypes,
      brands: filters.brands,
      sortBy: filters.sortBy,
    }),
    getAvailableBrands(),
  ]);

  const cacheKey = JSON.stringify({ ...filters, count: cars.length });

  return (
    <>
      <CarsHero totalCount={cars.length} />
      <CarsToolbar initialFilters={filters} brands={brands} />
      <section className="lux-container py-14 md:py-16">
        {cars.length === 0 ? (
          <CarsEmptyState />
        ) : (
          <CarsGrid cacheKey={cacheKey}>
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </CarsGrid>
        )}
      </section>
    </>
  );
}
