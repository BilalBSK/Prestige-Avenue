import { CarCard } from "@/components/cars/car-card";
import { HeroVideo } from "@/components/hero/hero-video";
import { AnimatedText, AnimatedUnderlineText } from "@/components/ui/animated-text";
import { InfoCard } from "@/components/ui/info-card";
import { getFeaturedCars } from "@/services/car.service";
import Link from "next/link";

export default async function Home() {
  const featuredCars = await getFeaturedCars(3);

  return (
    <div className="space-y-20 pb-10">
      <section className="relative isolate -mt-20 min-h-[100svh] overflow-hidden border-b border-zinc-800/60 md:-mt-24">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/22 to-black/5" />
        <div className="lux-container relative z-10 grid min-h-[100svh] items-end py-16 lg:grid-cols-12">
          <div className="max-w-3xl text-left lg:col-span-7">
            <AnimatedText
              text="Prestige Avenue"
              as="h1"
              animation="word-stagger"
              delay={100}
              className="font-[family:var(--font-display)] text-5xl font-semibold leading-[1.03] text-white md:text-7xl"
            />
            <AnimatedText
              text="Reservez aujourd'hui le vehicule qui vous ressemble, le prestige devient accessible."
              as="p"
              animation="blur-reveal"
              delay={600}
              className="mt-7 max-w-2xl text-lg leading-relaxed text-zinc-200 md:text-2xl"
            />
            <AnimatedText
              text="Vehicules controles, assurance incluse et assistance dediee. Profitez de la route, on s'occupe du reste."
              as="p"
              animation="fade-slide"
              delay={900}
              className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-300 md:text-lg"
            />
            <div className="text-elastic mt-9 flex flex-wrap gap-3">
              <Link href="/cars" className="lux-btn-primary">
                Voir le catalogue
              </Link>
              <Link href="#a-savoir" className="lux-btn-secondary">
                A savoir
              </Link>
            </div>
            <div className="text-fade-slide mt-10 inline-flex items-center gap-3 text-sm text-zinc-400">
              <span className="h-px w-10 bg-zinc-500/60" />
              Defilez pour explorer la flotte
            </div>
          </div>
        </div>
      </section>

      <section className="lux-container space-y-8">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="max-w-3xl text-left">
            <h2 className="text-4xl font-[family:var(--font-display)] font-semibold leading-tight text-white md:text-5xl">
              <AnimatedUnderlineText text="Audi A3 Sportback" className="text-light-sweep" />{" "}
              <AnimatedText
                text="a partir de 40 EUR, entrez dans une nouvelle dimension de conduite"
                as="span"
                animation="3d-tilt"
                delay={200}
              />
            </h2>
            <AnimatedText
              text="Des vehicules selectionnes pour leur technologie, leur confort et leur prestance. Trouvez le modele ideal et profitez d'un service pense pour une experience irreprochable."
              as="p"
              animation="fade-slide"
              delay={400}
              className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-300"
            />
          </div>
          <div className="text-elastic flex items-end justify-start lg:justify-end">
            <Link href="/cars" className="lux-btn-primary">
              Voir le catalogue
            </Link>
          </div>
        </div>

        <div className="lux-stagger grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </section>

      <section id="a-savoir" className="lux-container">
        <div className="lux-panel space-y-8 p-8 md:p-10">
          <div className="space-y-2">
            <AnimatedText
              text="Informations essentielles avant votre location"
              as="h3"
              animation="scale-reveal"
              delay={100}
              className="text-3xl font-[family:var(--font-display)] font-semibold text-white md:text-4xl"
            />
          </div>

          <div className="lux-stagger grid gap-6 md:grid-cols-2">
            <InfoCard
              title="À savoir"
              content="Retrouvez ici les informations essentielles concernant la location. Notre equipe reste disponible pour toute question complementaire."
              icon={
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <InfoCard
              title="Où ?"
              content="72 Rue de Lessard 76100, Rouen"
              icon={
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
          </div>

          <div className="lux-stagger grid gap-6 md:grid-cols-[1.5fr_1fr]">
            <InfoCard
              title="Pré-requis"
              content={
                <ul className="space-y-2 text-sm leading-relaxed text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white" />
                    <span>Permis de conduire valide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white" />
                    <span>Piece d&apos;identite valide</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white" />
                    <span>Justificatif de domicile -3 mois</span>
                  </li>
                </ul>
              }
              icon={
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <InfoCard
              title="Réservation"
              content="Pour toutes reservations un acompte vous sera demande."
              icon={
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
