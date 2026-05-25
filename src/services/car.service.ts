import { prisma } from "@/lib/prisma";
import { CarStatus, FuelType, Prisma, Transmission } from "@prisma/client";
import { unstable_cache } from "next/cache";

export const CARS_LIST_TAG = "cars:list";
export const CARS_BRANDS_TAG = "cars:brands";
export const CARS_FEATURED_TAG = "cars:featured";
export const CAR_DETAIL_TAG = (id: string) => `car:${id}`;

export type CarSortBy = "price-asc" | "price-desc" | "power-desc" | "newest";

export interface CarsFilterInput {
  minPrice?: number;
  maxPrice?: number;
  transmission?: Transmission;
  fuelTypes?: FuelType[];
  brands?: string[];
  status?: CarStatus;
  sortBy?: CarSortBy;
}

export const getFeaturedCars = unstable_cache(
  async (limit = 3) => {
    return prisma.car.findMany({
      where: { status: "AVAILABLE", isFeatured: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    });
  },
  ["cars:featured"],
  { tags: [CARS_FEATURED_TAG, CARS_LIST_TAG], revalidate: 300 },
);

function buildOrderBy(sortBy: CarSortBy | undefined): Prisma.CarOrderByWithRelationInput[] {
  switch (sortBy) {
    case "price-desc":
      return [{ pricePerDay: "desc" }, { createdAt: "desc" }];
    case "power-desc":
      return [{ power: "desc" }, { createdAt: "desc" }];
    case "newest":
      return [{ createdAt: "desc" }];
    case "price-asc":
    default:
      return [{ pricePerDay: "asc" }, { createdAt: "desc" }];
  }
}

async function getCarsUncached(filters: CarsFilterInput) {
  const where: Prisma.CarWhereInput = {
    status: filters.status ?? "AVAILABLE",
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          pricePerDay: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
    ...(filters.transmission ? { transmission: filters.transmission } : {}),
    ...(filters.fuelTypes && filters.fuelTypes.length > 0
      ? { fuelType: { in: filters.fuelTypes } }
      : {}),
    ...(filters.brands && filters.brands.length > 0
      ? { brand: { in: filters.brands } }
      : {}),
  };

  return prisma.car.findMany({
    where,
    orderBy: buildOrderBy(filters.sortBy),
  });
}

const getCarsCached = unstable_cache(
  (filters: CarsFilterInput) => getCarsUncached(filters),
  ["cars:list"],
  { tags: [CARS_LIST_TAG], revalidate: 300 },
);

export async function getCars(filters: CarsFilterInput = {}) {
  return getCarsCached(filters);
}

export const getCarById = unstable_cache(
  async (carId: string) => {
    return prisma.car.findUnique({
      where: { id: carId },
    });
  },
  ["car:detail"],
  { tags: [CARS_LIST_TAG], revalidate: 300 },
);

export async function getCarByIdOrThrow(carId: string) {
  return prisma.car.findUniqueOrThrow({
    where: { id: carId },
  });
}

export const getAvailableBrands = unstable_cache(
  async (): Promise<string[]> => {
    const rows = await prisma.car.findMany({
      where: { status: "AVAILABLE" },
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });
    return rows.map((r) => r.brand);
  },
  ["cars:brands"],
  { tags: [CARS_BRANDS_TAG, CARS_LIST_TAG], revalidate: 300 },
);

export async function getCarsCount(filters: CarsFilterInput = {}): Promise<number> {
  const where: Prisma.CarWhereInput = {
    status: filters.status ?? "AVAILABLE",
  };
  return prisma.car.count({ where });
}
