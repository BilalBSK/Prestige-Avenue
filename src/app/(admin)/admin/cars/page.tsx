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
        eyebrow="Catalogue — Gestion de la flotte"
        title={
          <>
            La flotte,
            <br />
            <span className="italic text-[color:var(--admin-text-muted)]">en majesté.</span>
          </>
        }
        lede="Orchestrez l'ordre, la visibilité et la tarification de chaque véhicule confié à votre soin."
        meta={
          <>
            <PageMetaItem label="Affichés" value={String(rows.length).padStart(2, "0")} />
            <span className="text-[color:var(--admin-text-muted)]/40">·</span>
            <PageMetaItem label="Flotte" value={String(totalCars).padStart(2, "0")} />
            <span className="text-[color:var(--admin-text-muted)]/40">·</span>
            <PageMetaItem label="Vitrine" value={String(featuredCount).padStart(2, "0")} />
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
      <div className="mt-8">
        <CarsList cars={rows} />
      </div>
    </>
  );
}
