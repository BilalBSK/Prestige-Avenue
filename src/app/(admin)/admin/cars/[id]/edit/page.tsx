import { CarForm } from "@/components/admin/cars/car-form";
import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
import { getCarForAdmin } from "@/server/admin/cars.queries";
import { type CarInput, featureSchema } from "@/server/admin/cars.schema";
import { notFound } from "next/navigation";
import { z } from "zod";

function toFormValues(car: Awaited<ReturnType<typeof getCarForAdmin>>): CarInput {
  if (!car) throw new Error("no car");
  const featuresParsed = z.array(featureSchema).safeParse(car.features);
  return {
    brand: car.brand,
    model: car.model,
    trim: car.trim,
    year: car.year,
    slug: car.slug,
    category: car.category,
    shortTagline: car.shortTagline,
    power: car.power,
    transmission: car.transmission,
    fuelType: car.fuelType,
    seats: car.seats,
    doors: car.doors,
    pricePerDay: Number(car.pricePerDay),
    pricePerKm: car.pricePerKm !== null ? Number(car.pricePerKm) : null,
    includedKmPerDay: car.includedKmPerDay,
    weekendPackagePrice:
      car.weekendPackagePrice !== null ? Number(car.weekendPackagePrice) : null,
    weekendPackageIncludedKm: car.weekendPackageIncludedKm,
    depositAmount: Number(car.depositAmount),
    minDriverAge: car.minDriverAge,
    minLicenseYears: car.minLicenseYears,
    description: car.description,
    highlights: car.highlights,
    features: featuresParsed.success ? featuresParsed.data : [],
    mainImage: car.mainImage,
    galleryImages: car.galleryImages,
    videoUrl: car.videoUrl,
    status: car.status,
    isFeatured: car.isFeatured,
    displayOrder: car.displayOrder,
  };
}

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await getCarForAdmin(id);
  if (!car) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Catalogue — Édition"
        title={
          <>
            {car.brand}{" "}
            <span className="italic text-[color:var(--admin-text-muted)]">{car.model}</span>
          </>
        }
        lede={car.trim ? `Finition ${car.trim}. Mise à jour publiée immédiatement sur le site.` : "Mise à jour publiée immédiatement sur le site public."}
        meta={
          <>
            <PageMetaItem label="Réf." value={`/${car.slug}`} />
            <span className="text-[color:var(--admin-text-muted)]/40">·</span>
            <PageMetaItem label="Année" value={car.year} />
            <span className="text-[color:var(--admin-text-muted)]/40">·</span>
            <PageMetaItem label="Statut" value={car.status} />
          </>
        }
      />
      <CarForm mode="edit" carId={car.id} initial={toFormValues(car)} uploadFolder={car.id} />
    </>
  );
}
