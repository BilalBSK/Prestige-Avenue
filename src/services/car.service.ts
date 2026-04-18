import { prisma } from "@/lib/prisma";
import { CarStatus } from "@prisma/client";

export interface CarsFilterInput {
  minPrice?: number;
  maxPrice?: number;
  status?: CarStatus;
}

export async function getFeaturedCars(limit = 3) {
  return prisma.car.findMany({
    where: { status: "AVAILABLE", isFeatured: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getCars(filters: CarsFilterInput = {}) {
  return prisma.car.findMany({
    where: {
      status: filters.status ?? "AVAILABLE",
      ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
        ? {
            pricePerDay: {
              ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
              ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
            },
          }
        : {}),
    },
    orderBy: [
      { displayOrder: "asc" },
      { pricePerDay: "asc" },
      { createdAt: "desc" },
    ],
  });
}

export async function getCarById(carId: string) {
  return prisma.car.findUnique({
    where: { id: carId },
  });
}

export async function getCarByIdOrThrow(carId: string) {
  return prisma.car.findUniqueOrThrow({
    where: { id: carId },
  });
}
