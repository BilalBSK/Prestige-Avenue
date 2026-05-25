import { notFound } from "next/navigation";
import { CarDetailHero } from "@/components/cars/car-detail-hero";
import { CarTitleBlock } from "@/components/cars/car-title-block";
import { CarGallery } from "@/components/cars/car-gallery";
import { CarSpecs } from "@/components/cars/car-specs";
import { CarHighlights } from "@/components/cars/car-highlights";
import { CarFeatures } from "@/components/cars/car-features";
import { CarVideo } from "@/components/cars/car-video";
import { CarPricingPanel } from "@/components/cars/car-pricing-panel";
import { CarCtaSection } from "@/components/cars/car-cta-section";
import { CarReserveBar } from "@/components/cars/car-reserve-bar";
import { BookingSheetProvider } from "@/components/cars/booking-sheet-provider";
import { getCarById } from "@/services/car.service";

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

interface FeatureEntry {
  title: string;
  body: string;
}

function parseFeatures(raw: unknown): FeatureEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry): FeatureEntry | null => {
      if (typeof entry !== "object" || entry === null) return null;
      const obj = entry as Record<string, unknown>;
      const title = typeof obj.title === "string" ? obj.title.trim() : "";
      const body = typeof obj.body === "string" ? obj.body.trim() : "";
      if (!title || !body) return null;
      return { title, body };
    })
    .filter((entry): entry is FeatureEntry => entry !== null);
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params;
  const car = await getCarById(id);
  if (!car || car.status === "DISABLED") notFound();

  const features = parseFeatures(car.features);
  const highlights = car.highlights.filter(Boolean);
  const galleryImages = car.galleryImages.filter(Boolean);
  const pricePerDay = Number(car.pricePerDay);
  const weekendPackagePrice =
    car.weekendPackagePrice !== null && car.weekendPackagePrice !== undefined
      ? Number(car.weekendPackagePrice)
      : null;
  const pricePerKm =
    car.pricePerKm !== null && car.pricePerKm !== undefined
      ? Number(car.pricePerKm)
      : null;

  let sectionIndex = 1;
  let total = 3;
  if (galleryImages.length > 0) total += 1;
  if (highlights.length > 0) total += 1;
  if (features.length > 0) total += 1;
  if (car.videoUrl) total += 1;

  return (
    <BookingSheetProvider
      carId={car.id}
      brand={car.brand}
      model={car.model}
      pricePerDay={pricePerDay}
      pricePerKm={pricePerKm}
      weekendPackagePrice={weekendPackagePrice}
    >
      <CarReserveBar
        brand={car.brand}
        model={car.model}
        pricePerDay={pricePerDay}
        pricePerKm={pricePerKm}
      />
      <main className="bg-[var(--ink-onyx)]">
        <CarDetailHero
          brand={car.brand}
          model={car.model}
          trim={car.trim}
          mainImage={car.mainImage}
          pricePerDay={pricePerDay}
          pricePerKm={pricePerKm}
        />

        <CarTitleBlock
          brand={car.brand}
          model={car.model}
          trim={car.trim}
          shortTagline={car.shortTagline}
          description={car.description}
          index={sectionIndex++}
          total={total}
        />

        <CarPricingPanel
          pricePerDay={pricePerDay}
          weekendPackagePrice={weekendPackagePrice}
          weekendPackageIncludedKm={car.weekendPackageIncludedKm}
          includedKmPerDay={car.includedKmPerDay}
          pricePerKm={pricePerKm}
          depositAmount={Number(car.depositAmount)}
          minDriverAge={car.minDriverAge}
          minLicenseYears={car.minLicenseYears}
          index={sectionIndex++}
          total={total}
        />

        {galleryImages.length > 0 && (
          <CarGallery images={galleryImages} alt={`${car.brand} ${car.model}`} />
        )}

        <CarSpecs
          power={car.power}
          transmission={car.transmission}
          fuelType={car.fuelType}
          seats={car.seats}
          doors={car.doors}
          year={car.year}
          index={sectionIndex++}
          total={total}
        />

        {highlights.length > 0 && <CarHighlights highlights={highlights} />}

        {features.length > 0 && <CarFeatures features={features} />}

        {car.videoUrl && (
          <CarVideo videoUrl={car.videoUrl} title={`${car.brand} ${car.model}`} />
        )}

        <CarCtaSection
          brand={car.brand}
          model={car.model}
          pricePerDay={pricePerDay}
          pricePerKm={pricePerKm}
        />
      </main>
    </BookingSheetProvider>
  );
}
