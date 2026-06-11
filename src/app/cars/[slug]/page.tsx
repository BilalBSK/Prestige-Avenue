import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { CarDetailHero } from "@/components/cars/car-detail-hero";
import { CarTitleBlock } from "@/components/cars/car-title-block";
import { CarStudio } from "@/components/cars/car-studio";
import { CarSpecs } from "@/components/cars/car-specs";
import { CarHighlights } from "@/components/cars/car-highlights";
import { CarFeatures } from "@/components/cars/car-features";
import { CarPricingPanel } from "@/components/cars/car-pricing-panel";
import { CarCtaSection } from "@/components/cars/car-cta-section";
import { CarReserveBar } from "@/components/cars/car-reserve-bar";
import { BookingSheetProvider } from "@/components/cars/booking-sheet-provider";
import { parseRentalConditions } from "@/lib/cars/conditions";
import { flattenShots, parseShots, shotsFromLegacyGallery } from "@/lib/cars/shots";
import { isHostedVideo } from "@/lib/cars/video";
import { getCarById, getCarBySlug, getPublicCarRoutes } from "@/services/car.service";

interface CarDetailPageProps {
  params: Promise<{ slug: string }>;
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

// Résout la fiche à partir du segment d'URL. Le segment canonique est le slug
// lisible ; on tolère un ancien identifiant cuid (liens partagés / favoris
// d'avant la bascule) afin de pouvoir rediriger vers l'URL propre.
async function resolveCar(segment: string) {
  const bySlug = await getCarBySlug(segment);
  if (bySlug) return bySlug;
  return getCarById(segment);
}

// Pré-rend les fiches publiables au build. Les véhicules ajoutés ensuite sont
// rendus à la demande (dynamicParams reste à true par défaut).
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const routes = await getPublicCarRoutes();
  return routes.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({
  params,
}: CarDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const car = await resolveCar(slug);
  if (!car || car.status === "DISABLED") {
    return { title: "Véhicule introuvable — Prestige Avenue" };
  }

  const name = [car.brand, car.model, car.trim].filter(Boolean).join(" ");
  const title = `${name} en location à Rouen`;
  const description =
    car.shortTagline?.trim() ||
    car.description.replace(/\s+/g, " ").trim().slice(0, 155);
  const canonical = `/cars/${car.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${title} — Prestige Avenue`,
      description,
      url: canonical,
      images: car.mainImage ? [{ url: car.mainImage, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Prestige Avenue`,
      description,
      images: car.mainImage ? [car.mainImage] : undefined,
    },
  };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { slug } = await params;
  const car = await resolveCar(slug);
  if (!car || car.status === "DISABLED") notFound();

  // URL canonique = le slug. Si on est arrivé via un ancien identifiant cuid,
  // on redirige en 308 vers l'URL lisible (préserve favoris et référencement).
  if (car.slug !== slug) permanentRedirect(`/cars/${car.slug}`);

  const features = parseFeatures(car.features);
  const highlights = car.highlights.filter(Boolean);

  // Studio photo : prises de vue cataloguées par angle, avec repli sur la
  // galerie héritée pour les véhicules pas encore reclassés.
  const shots = parseShots(car.galleryShots);
  const studioShots =
    shots.length > 0
      ? flattenShots(shots)
      : shotsFromLegacyGallery(car.galleryImages);
  const videoUrl = isHostedVideo(car.videoUrl) ? car.videoUrl : null;
  const hasStudio = studioShots.length > 0 || videoUrl !== null;

  // Image d'illustration de la section « Sélection ». Priorité à l'image
  // choisie par l'admin ; à défaut, repli sur une vue intérieure (l'habitacle
  // « rend remarquable »), puis la première prise de vue, puis l'image
  // principale (toujours présente). Garantit un visuel non vide en toutes
  // circonstances, sans backfill des véhicules existants.
  const adminHighlightImage = car.highlightImage?.trim() ? car.highlightImage : null;
  const fallbackShot =
    studioShots.find((shot) => shot.group === "INTERIEUR") ?? studioShots[0] ?? null;
  const highlightImage = adminHighlightImage ?? fallbackShot?.url ?? car.mainImage;
  // Légende : si l'admin a fourni l'image, on la légende sobrement au modèle ;
  // sinon on réutilise la légende d'angle de la prise de vue de repli.
  const highlightCaption = adminHighlightImage
    ? `${car.brand} ${car.model}`
    : fallbackShot?.caption ?? `${car.brand} ${car.model}`;

  const pricePerDay = Number(car.pricePerDay);
  const weekendPackagePrice48h =
    car.weekendPackagePrice48h !== null && car.weekendPackagePrice48h !== undefined
      ? Number(car.weekendPackagePrice48h)
      : null;
  const weekendPackagePrice72h =
    car.weekendPackagePrice72h !== null && car.weekendPackagePrice72h !== undefined
      ? Number(car.weekendPackagePrice72h)
      : null;
  const pricePerKm =
    car.pricePerKm !== null && car.pricePerKm !== undefined
      ? Number(car.pricePerKm)
      : null;
  const rentalConditions = parseRentalConditions(car.rentalConditions);

  let sectionIndex = 1;
  let total = 3;
  if (hasStudio) total += 1;
  if (highlights.length > 0) total += 1;
  if (features.length > 0) total += 1;

  return (
    <BookingSheetProvider
      carId={car.id}
      brand={car.brand}
      model={car.model}
      pricePerDay={pricePerDay}
      pricePerKm={pricePerKm}
      weekendPackagePrice48h={weekendPackagePrice48h}
      weekendPackagePrice72h={weekendPackagePrice72h}
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

        {hasStudio && (
          <CarStudio
            shots={studioShots}
            videoUrl={videoUrl}
            poster={car.mainImage}
            alt={`${car.brand} ${car.model}`}
          />
        )}

        <CarPricingPanel
          pricePerDay={pricePerDay}
          weekendPackagePrice48h={weekendPackagePrice48h}
          weekendPackageIncludedKm48h={car.weekendPackageIncludedKm48h}
          weekendPackagePrice72h={weekendPackagePrice72h}
          weekendPackageIncludedKm72h={car.weekendPackageIncludedKm72h}
          includedKmPerDay={car.includedKmPerDay}
          pricePerKm={pricePerKm}
          depositAmount={Number(car.depositAmount)}
          rentalConditions={rentalConditions}
          index={sectionIndex++}
          total={total}
        />

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

        {highlights.length > 0 && (
          <CarHighlights
            highlights={highlights}
            image={highlightImage}
            imageCaption={highlightCaption}
            brand={car.brand}
            model={car.model}
          />
        )}

        {features.length > 0 && <CarFeatures features={features} />}

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
