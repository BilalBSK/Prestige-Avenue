import type { CarSortBy } from "@/services/car.service";
import type { FuelType, Transmission } from "@prisma/client";

export const PRICE_MIN = 50;
export const PRICE_MAX = 800;
export const PRICE_STEP = 10;

export const FUEL_OPTIONS: { value: FuelType; label: string }[] = [
  { value: "PETROL", label: "Essence" },
  { value: "DIESEL", label: "Diesel" },
  { value: "HYBRID", label: "Hybride" },
  { value: "PLUG_IN_HYBRID", label: "Hybride rechargeable" },
  { value: "ELECTRIC", label: "Électrique" },
];

export const TRANSMISSION_OPTIONS: { value: Transmission | "ALL"; label: string }[] = [
  { value: "ALL", label: "Toutes" },
  { value: "AUTOMATIC", label: "Auto" },
  { value: "MANUAL", label: "Manuelle" },
];

export const SORT_OPTIONS: { value: CarSortBy; label: string }[] = [
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "power-desc", label: "Puissance" },
  { value: "newest", label: "Plus récent" },
];

export interface CatalogFiltersState {
  minPrice: number;
  maxPrice: number;
  transmission: Transmission | null;
  fuelTypes: FuelType[];
  brands: string[];
  sortBy: CarSortBy;
}

export const DEFAULT_FILTERS: CatalogFiltersState = {
  minPrice: PRICE_MIN,
  maxPrice: PRICE_MAX,
  transmission: null,
  fuelTypes: [],
  brands: [],
  sortBy: "price-asc",
};

export function parseFiltersFromSearchParams(
  params: Record<string, string | string[] | undefined>,
): CatalogFiltersState {
  const minPrice = Number(params.minPrice);
  const maxPrice = Number(params.maxPrice);

  const fuelTypesRaw = typeof params.fuelType === "string" ? params.fuelType.split(",") : [];
  const allowedFuel = new Set(FUEL_OPTIONS.map((o) => o.value));
  const fuelTypes = fuelTypesRaw.filter((v): v is FuelType => allowedFuel.has(v as FuelType));

  const brandsRaw = typeof params.brands === "string" ? params.brands.split(",") : [];
  const brands = brandsRaw.map((b) => b.trim()).filter(Boolean);

  const transmissionRaw = typeof params.transmission === "string" ? params.transmission : null;
  const transmission =
    transmissionRaw === "AUTOMATIC" || transmissionRaw === "MANUAL" ? transmissionRaw : null;

  const sortRaw = typeof params.sortBy === "string" ? params.sortBy : "";
  const allowedSort = new Set(SORT_OPTIONS.map((o) => o.value));
  const sortBy = allowedSort.has(sortRaw as CarSortBy) ? (sortRaw as CarSortBy) : "price-asc";

  return {
    minPrice: Number.isFinite(minPrice) && minPrice >= PRICE_MIN ? Math.min(minPrice, PRICE_MAX) : PRICE_MIN,
    maxPrice: Number.isFinite(maxPrice) && maxPrice <= PRICE_MAX ? Math.max(maxPrice, PRICE_MIN) : PRICE_MAX,
    transmission,
    fuelTypes,
    brands,
    sortBy,
  };
}

export function serializeFiltersToParams(state: CatalogFiltersState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.minPrice !== PRICE_MIN) params.set("minPrice", String(state.minPrice));
  if (state.maxPrice !== PRICE_MAX) params.set("maxPrice", String(state.maxPrice));
  if (state.transmission) params.set("transmission", state.transmission);
  if (state.fuelTypes.length) params.set("fuelType", state.fuelTypes.join(","));
  if (state.brands.length) params.set("brands", state.brands.join(","));
  if (state.sortBy !== "price-asc") params.set("sortBy", state.sortBy);
  return params;
}

export function activeFilterCount(state: CatalogFiltersState): number {
  let n = 0;
  if (state.minPrice !== PRICE_MIN || state.maxPrice !== PRICE_MAX) n += 1;
  if (state.transmission) n += 1;
  if (state.fuelTypes.length) n += 1;
  if (state.brands.length) n += 1;
  return n;
}
