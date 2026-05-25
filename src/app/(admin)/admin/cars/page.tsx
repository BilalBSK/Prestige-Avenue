import { buttonVariants } from "@/components/admin/ui/button-variants";
import { CarsFilters } from "@/components/admin/cars/cars-filters";
import { CarsList } from "@/components/admin/cars/cars-list";
import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
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

  const [cars, totalCars, featuredCount] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { bookings: true } } },
    }),
    prisma.car.count(),
    prisma.car.count({ where: { isFeatured: true } }),
  ]);

  const rows = cars.map((c) => ({
    id: c.id,
    brand: c.brand,
    model: c.model,
    trim: c.trim,
    slug: c.slug,
    category: c.category,
    status: c.status,
    mainImage: c.mainImage,
    pricePerDay: Number(c.pricePerDay),
    weekendPackagePrice: c.weekendPackagePrice !== null ? Number(c.weekendPackagePrice) : null,
    isFeatured: c.isFeatured,
    bookingCount: c._count.bookings,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Flotte"
        lede="Gérez l'ordre, la visibilité et la tarification de chaque véhicule."
        meta={
          <>
            <PageMetaItem label="Affichés" value={rows.length} />
            <PageMetaItem label="Total" value={totalCars} />
            <PageMetaItem label="Vitrine" value={featuredCount} />
          </>
        }
        actions={
          <Link
            href="/admin/cars/new"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            Ajouter un véhicule
          </Link>
        }
      />
      <CarsFilters />
      <CarsList cars={rows} />
    </>
  );
}
