import { getFeaturedCars } from "@/services/car.service";
import { HeroSection } from "@/components/home/hero-section";
import { ManifestoSection } from "@/components/home/manifesto-section";
import { FleetSection } from "@/components/home/fleet-section";
import { ProcessSection } from "@/components/home/process-section";
import { InfoSection } from "@/components/home/info-section";
import { CtaSection } from "@/components/home/cta-section";

export default async function Home() {
  const featuredCars = await getFeaturedCars(3);

  return (
    <>
      <HeroSection />
      <ManifestoSection />
      <FleetSection cars={featuredCars} />
      <ProcessSection />
      <InfoSection />
      <CtaSection />
    </>
  );
}
