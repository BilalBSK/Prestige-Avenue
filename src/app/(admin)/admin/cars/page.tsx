import { Button } from "@/components/admin/ui/button";
import { CarsFilters } from "@/components/admin/cars/cars-filters";
import { CarsList } from "@/components/admin/cars/cars-list";
import { prisma } from "@/lib/prisma";
import { CarStatus, Prisma } from "@prisma/client";
import Link from "next/link";

interface SearchParams {
  q?: string;
  status?: string;
  featured?: string;
}

export default async function AdminCarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const where: Prisma.CarWhereInput = {};
  if (sp.q) {
    where.OR = [
      { brand: { contains: sp.q, mode: "insensitive" } },
      { model: { contains: sp.q, mode: "insensitive" } },
      { slug: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.status && ["AVAILABLE", "MAINTENANCE", "DISABLED"].includes(sp.status)) {
    where.status = sp.status as CarStatus;
  }
  if (sp.featured === "yes") where.isFeatured = true;
  if (sp.featured === "no") where.isFeatured = false;

  const cars = await prisma.car.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { bookings: true } } },
  });

  const withBookingCount = cars.map((c) => ({
    ...c,
    _bookingCount: c._count.bookings,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Voitures</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Gérez votre flotte : ajoutez, modifiez, réordonnez.
          </p>
        </div>
        <Link href="/admin/cars/new">
          <Button>+ Nouveau véhicule</Button>
        </Link>
      </div>
      <CarsFilters />
      <CarsList cars={withBookingCount} />
    </div>
  );
}
