import { InfoCard } from "@/components/ui/info-card";
import { SectionCounter } from "./section-counter";
import { InfoReveal } from "./info-reveal";

export function InfoSection() {
  return (
    <section id="a-savoir" className="info py-32 md:py-40">
      <div className="lux-container">
        <SectionCounter index={5} className="mb-5" />
        <h2 className="mb-12 max-w-[720px] font-[family:var(--font-fraunces)] text-[clamp(34px,4.4vw,48px)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--ink-ivory)]">
          Informations essentielles <em className="italic font-normal">avant votre location.</em>
        </h2>

        <InfoReveal>
          <InfoCard title={<>À <em className="italic font-normal">savoir</em></>}>
            Retrouvez ici les informations essentielles concernant la location. Notre equipe reste disponible pour toute question complementaire.
          </InfoCard>
          <InfoCard title={<><em className="italic font-normal">Où</em> ?</>}>
            72 Rue de Lessard
            <br />
            76100, Rouen
          </InfoCard>
          <InfoCard title={<><em className="italic font-normal">Pré-requis</em></>}>
            <ul className="m-0 list-none p-0">
              <li className="border-t border-[var(--ink-line)] py-[7px] first:border-t-0 first:pt-0">
                <span className="text-[var(--ink-muted)]">— </span>Permis de conduire valide
              </li>
              <li className="border-t border-[var(--ink-line)] py-[7px]">
                <span className="text-[var(--ink-muted)]">— </span>Piece d&apos;identite valide
              </li>
              <li className="border-t border-[var(--ink-line)] py-[7px]">
                <span className="text-[var(--ink-muted)]">— </span>Justificatif de domicile -3 mois
              </li>
            </ul>
          </InfoCard>
          <InfoCard title={<><em className="italic font-normal">Réservation</em></>}>
            Pour toutes reservations un acompte vous sera demande (40% du total).
          </InfoCard>
        </InfoReveal>
      </div>
    </section>
  );
}
