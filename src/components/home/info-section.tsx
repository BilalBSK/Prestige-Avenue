import { InfoCard } from "@/components/ui/info-card";
import { SectionCounter } from "./section-counter";
import { InfoReveal } from "./info-reveal";
import { WordHighlight } from "./word-highlight";

export function InfoSection() {
  return (
    <section id="a-savoir" className="info py-32 md:py-40">
      <div className="lux-container">
        <SectionCounter index={5} className="mb-5" />
        <WordHighlight
          as="h2"
          text="Informations essentielles avant votre location."
          italicFromIndex={2}
          className="mb-12 max-w-[720px] text-[clamp(34px,4.4vw,48px)] leading-[1.05]"
        />

        <InfoReveal>
          <InfoCard index={1} title={<>À <em className="italic font-normal">savoir</em></>}>
            Retrouvez ici les informations essentielles concernant la location. Notre équipe reste disponible pour toute question complémentaire.
          </InfoCard>
          <InfoCard index={2} title={<><em className="italic font-normal">Où</em> ?</>}>
            191 route des Docks
            <br />
            76120, Le Grand-Quevilly
          </InfoCard>
          <InfoCard index={3} title={<><em className="italic font-normal">Pré-requis</em></>}>
            <ul className="m-0 list-none p-0">
              <li className="border-t border-[var(--ink-line)] py-[7px] first:border-t-0 first:pt-0">
                <span className="text-[var(--ink-muted)]">— </span>Permis de conduire valide
              </li>
              <li className="border-t border-[var(--ink-line)] py-[7px]">
                <span className="text-[var(--ink-muted)]">— </span>Pièce d&apos;identité valide
              </li>
              <li className="border-t border-[var(--ink-line)] py-[7px]">
                <span className="text-[var(--ink-muted)]">— </span>Justificatif de domicile -3 mois
              </li>
            </ul>
          </InfoCard>
          <InfoCard index={4} title={<><em className="italic font-normal">Réservation</em></>}>
            Aucun paiement en ligne. Vous soumettez une demande, nous validons sous 24 h ouvrées, le règlement intervient à la remise des clés.
          </InfoCard>
        </InfoReveal>
      </div>
    </section>
  );
}
