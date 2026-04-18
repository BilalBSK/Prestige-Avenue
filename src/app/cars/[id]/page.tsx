import { BookingForm } from "@/components/booking/booking-form";
import { AnimatedText } from "@/components/ui/animated-text";
import { getCarById } from "@/services/car.service";
import Image from "next/image";
import { notFound } from "next/navigation";

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
        <AnimatedText
          text={car.description}
          as="p"
          animation="blur-reveal"
          delay={400}
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

      <section className="grid gap-6 md:grid-cols-2">
        <div className="lux-panel lux-card-soft p-6">
          <h2 className="text-xl font-medium text-white">Informations location</h2>
          <ul className="mt-4 space-y-2 text-zinc-300">
            <li>Prix par jour: {Number(car.pricePerDay).toFixed(2)} EUR</li>
            <li>
              Prix weekend:{" "}
              {car.weekendPrice ? `${Number(car.weekendPrice).toFixed(2)} EUR` : "Non applique"}
            </li>
            <li>Caution: {Number(car.depositAmount).toFixed(2)} EUR</li>
            <li>Statut: {car.status}</li>
          </ul>
        </div>
        <BookingForm
          carId={car.id}
          pricePerDay={Number(car.pricePerDay)}
          weekendPrice={car.weekendPrice ? Number(car.weekendPrice) : null}
          depositAmount={Number(car.depositAmount)}
        />
      </section>
    </div>
  );
}
