import { getFeaturedCars } from "@/services/car.service";
import { HeroSection } from "@/components/home/hero-section";
import { ManifestoSection } from "@/components/home/manifesto-section";
import { FleetSection } from "@/components/home/fleet-section";
import { ProcessSection } from "@/components/home/process-section";
import { InfoSection } from "@/components/home/info-section";
import { CtaSection } from "@/components/home/cta-section";
import { ScrollLegend } from "@/components/home/scroll-legend";

const LEGEND_ITEMS = [
  { id: "accueil", label: "Accueil" },
  { id: "manifeste", label: "Manifeste" },
  { id: "flotte", label: "La flotte" },
  { id: "processus", label: "Le processus" },
  { id: "a-savoir", label: "À savoir" },
  { id: "reserver", label: "Réserver" },
];

export default async function Home() {
  const featuredCars = await getFeaturedCars(3);

  return (
    <>
      <ScrollLegend items={LEGEND_ITEMS} />
      <HeroSection />
      <ManifestoSection />
      <FleetSection cars={featuredCars} />
      <ProcessSection />
      <InfoSection />
      <CtaSection />
    </>
  );
}
