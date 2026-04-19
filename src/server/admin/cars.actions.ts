"use server";

import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { carFormSchema, type CarInput } from "./cars.schema";

function toPrismaData(input: CarInput) {
  return {
    brand: input.brand,
    model: input.model,
    trim: input.trim,
    year: input.year,
    slug: input.slug,
    category: input.category,
    shortTagline: input.shortTagline,
    power: input.power,
    transmission: input.transmission,
    fuelType: input.fuelType,
    seats: input.seats,
    doors: input.doors,
    pricePerDay: new Prisma.Decimal(input.pricePerDay),
    pricePerKm: input.pricePerKm !== null ? new Prisma.Decimal(input.pricePerKm) : null,
    includedKmPerDay: input.includedKmPerDay,
    weekendPackagePrice:
      input.weekendPackagePrice !== null ? new Prisma.Decimal(input.weekendPackagePrice) : null,
    weekendPackageIncludedKm: input.weekendPackageIncludedKm,
    depositAmount: new Prisma.Decimal(input.depositAmount),
    minDriverAge: input.minDriverAge,
    minLicenseYears: input.minLicenseYears,
    description: input.description,
    highlights: input.highlights,
    features: input.features,
    mainImage: input.mainImage,
    galleryImages: input.galleryImages,
    videoUrl: input.videoUrl,
    status: input.status,
    isFeatured: input.isFeatured,
    displayOrder: input.displayOrder,
  };
}

function revalidateCarSurfaces() {
  revalidatePath("/admin/cars");
  revalidatePath("/cars");
  revalidatePath("/");
}

export async function createCar(input: CarInput): Promise<{ id: string }> {
  await requireAdminSessionOrRedirect();
  const parsed = carFormSchema.parse(input);

  try {
    const created = await prisma.car.create({ data: toPrismaData(parsed) });
    revalidateCarSurfaces();
    return { id: created.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Ce slug est déjà utilisé.");
    }
    throw error;
  }
}

export async function updateCar(id: string, input: CarInput): Promise<void> {
  await requireAdminSessionOrRedirect();
  const parsed = carFormSchema.parse(input);

  try {
    await prisma.car.update({ where: { id }, data: toPrismaData(parsed) });
    revalidateCarSurfaces();
    revalidatePath(`/cars/${id}`);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("Ce slug est déjà utilisé.");
    }
    throw error;
  }
}

export async function deleteCar(id: string): Promise<{ softDeleted: boolean }> {
  await requireAdminSessionOrRedirect();

  const bookingCount = await prisma.booking.count({ where: { carId: id } });
  if (bookingCount > 0) {
    await prisma.car.update({ where: { id }, data: { status: "DISABLED" } });
    revalidateCarSurfaces();
    return { softDeleted: true };
  }

  await prisma.$transaction([
    prisma.blockedDate.deleteMany({ where: { carId: id } }),
    prisma.car.delete({ where: { id } }),
  ]);
  revalidateCarSurfaces();
  return { softDeleted: false };
}

export async function toggleCarFeatured(id: string): Promise<void> {
  await requireAdminSessionOrRedirect();
  const car = await prisma.car.findUnique({ where: { id }, select: { isFeatured: true } });
  if (!car) throw new Error("Véhicule introuvable.");
  await prisma.car.update({ where: { id }, data: { isFeatured: !car.isFeatured } });
  revalidateCarSurfaces();
}

export async function reorderCars(orderedIds: string[]): Promise<void> {
  await requireAdminSessionOrRedirect();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.car.update({ where: { id }, data: { displayOrder: index + 1 } }),
    ),
  );
  revalidateCarSurfaces();
}
