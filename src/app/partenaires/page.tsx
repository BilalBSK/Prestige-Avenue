import type { Metadata } from "next";
import { PartnersHero } from "@/components/partners/partners-hero";
import { PartnersCollaborations } from "@/components/partners/partners-collaborations";
import { PartnersTypes } from "@/components/partners/partners-types";
import { PartnersProcess } from "@/components/partners/partners-process";
import { PartnersCta } from "@/components/partners/partners-cta";

export const metadata: Metadata = {
  title: "Partenaires & Professionnels — Prestige Avenue",
  description:
    "Prestige Avenue recherche en permanence de nouveaux partenaires : échange de visibilité, création de contenu, apport d'affaires et commissions. Construisons ensemble.",
};

export default function PartnersPage() {
  return (
    <>
      <PartnersHero />
      <PartnersCollaborations />
      <PartnersTypes />
      <PartnersProcess />
      <PartnersCta />
    </>
  );
}
