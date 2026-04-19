import { CarForm } from "@/components/admin/cars/car-form";
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Éditer : {car.brand} {car.model}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Les modifications sont visibles immédiatement sur le site public.
        </p>
      </div>
      <CarForm mode="edit" carId={car.id} initial={toFormValues(car)} uploadFolder={car.id} />
    </div>
  );
}
