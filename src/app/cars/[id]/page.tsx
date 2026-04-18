import { BookingForm } from "@/components/booking/booking-form";
import { AnimatedText } from "@/components/ui/animated-text";
import { getCarById } from "@/services/car.service";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { FuelType, Transmission } from "@prisma/client";

function transmissionLabel(value: Transmission): string {
  return value === "AUTOMATIC" ? "Automatique" : "Manuelle";
}

function fuelLabel(value: FuelType): string {
  const labels: Record<FuelType, string> = {
    PETROL: "Essence",
    DIESEL: "Diesel",
    HYBRID: "Hybride",
    PLUG_IN_HYBRID: "Hybride rechargeable",
    ELECTRIC: "Électrique",
  };
  return labels[value];
}

function SpecTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="text-base text-white">{value}</p>
    </div>
  );
}

interface CarDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { id } = await params;
  const car = await getCarById(id);

  if (!car) {
    notFound();
  }

  return (
    <div className="lux-container space-y-8 py-12">
      <div className="space-y-3">
        <h1 className="text-4xl font-[family:var(--font-display)] md:text-5xl">
          <AnimatedText
            text={car.brand}
            as="span"
            animation="light-sweep-slow"
            className="inline-block"
          />{" "}
          <AnimatedText
            text={car.model}
            as="span"
            animation="3d-tilt"
            delay={200}
            className="inline-block text-white"
          />
        </h1>
        {car.shortTagline && (
          <AnimatedText
            text={car.shortTagline}
            as="p"
            animation="blur-reveal"
            delay={400}
            className="max-w-3xl text-lg text-zinc-300"
          />
        )}
        <AnimatedText
          text={car.description}
          as="p"
          animation="blur-reveal"
          delay={500}
          className="max-w-3xl text-zinc-400"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="relative h-80 overflow-hidden rounded-2xl border border-zinc-800/90">
          <Image
            src={car.mainImage}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
          <div className="grid grid-cols-2 gap-3">
          {car.galleryImages.slice(0, 4).map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative h-36 overflow-hidden rounded-xl border border-zinc-800/90"
            >
              <Image
                src={image}
                alt={`${car.brand} ${car.model} - vue ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>

      {car.videoUrl && (
        <section className="space-y-2">
          <h2 className="text-xl font-medium text-white">Video</h2>
          <div className="aspect-video overflow-hidden rounded-xl border border-zinc-800/90">
            <iframe
              src={car.videoUrl}
              className="h-full w-full"
              allowFullScreen
              title={`Video ${car.brand} ${car.model}`}
            />
          </div>
        </section>
      )}

      <section className="lux-panel lux-card-soft grid gap-4 p-6 md:grid-cols-4">
        <SpecTile label="Puissance" value={`${car.power} ch`} />
        <SpecTile label="Transmission" value={transmissionLabel(car.transmission)} />
        <SpecTile label="Carburant" value={fuelLabel(car.fuelType)} />
        <SpecTile label="Places" value={`${car.seats}`} />
      </section>

      {car.highlights.length > 0 && (
        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {car.highlights.map((highlight) => (
            <div
              key={highlight}
              className="lux-panel rounded-xl border border-zinc-800/70 px-4 py-3 text-sm text-zinc-200"
            >
              {highlight}
            </div>
          ))}
        </section>
      )}

      {Array.isArray(car.features) && car.features.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-medium text-white">Points forts</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(car.features as Array<{ title: string; body: string }>).map((feature) => (
              <article key={feature.title} className="lux-panel space-y-2 p-5">
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 md:grid-cols-2">
        <div className="lux-panel lux-card-soft p-6">
          <h2 className="text-xl font-medium text-white">Informations location</h2>
          <ul className="mt-4 space-y-2 text-zinc-300">
            <li>Tarif semaine : {Number(car.pricePerDay).toFixed(2)} € / jour</li>
            {car.weekendPackagePrice && (
              <li>
                Forfait week-end 72h (Ven → Lun) : {Number(car.weekendPackagePrice).toFixed(2)} €
              </li>
            )}
            {car.pricePerKm && car.includedKmPerDay && (
              <li>
                Kilométrage : {car.includedKmPerDay} km / jour inclus, puis{" "}
                {Number(car.pricePerKm).toFixed(2)} € / km
              </li>
            )}
            <li>Caution : {Number(car.depositAmount).toFixed(2)} €</li>
            <li>Âge minimum conducteur : {car.minDriverAge} ans</li>
            <li>Permis depuis au moins : {car.minLicenseYears} ans</li>
          </ul>
        </div>
        <BookingForm
          carId={car.id}
          pricePerDay={Number(car.pricePerDay)}
          weekendPackagePrice={car.weekendPackagePrice ? Number(car.weekendPackagePrice) : null}
          depositAmount={Number(car.depositAmount)}
          pricePerKm={car.pricePerKm ? Number(car.pricePerKm) : null}
          includedKmPerDay={car.includedKmPerDay ?? null}
        />
      </section>
    </div>
  );
}
