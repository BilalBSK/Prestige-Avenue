"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { SectionCounter } from "@/components/home/section-counter";

interface CarPricingPanelProps {
  pricePerDay: number;
  weekendPackagePrice: number | null;
  weekendPackageIncludedKm: number | null;
  includedKmPerDay: number | null;
  pricePerKm: number | null;
  depositAmount: number;
  minDriverAge: number;
  minLicenseYears: number;
  index: number;
  total: number;
}

interface RowProps {
  label: string;
  value: string;
  subValue?: string;
  hint?: string;
}

function Row({ label, value, subValue, hint }: RowProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-6 border-t border-[var(--ink-line)] py-6">
      <div>
        <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
          {label}
        </p>
        {hint && (
          <p className="mt-2 font-[family:var(--font-dm-sans)] text-[12px] leading-[1.55] text-[var(--ink-text-soft)]">
            {hint}
          </p>
        )}
      </div>
      <div className="text-right">
        <p className="font-[family:var(--font-fraunces)] text-[clamp(22px,2.4vw,32px)] font-light leading-[1] tracking-[-0.015em] text-[var(--ink-ivory)]">
          {value}
        </p>
        {subValue && (
          <p className="mt-1.5 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.22em] text-[var(--ink-text-soft)]">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

export function CarPricingPanel({
  pricePerDay,
  weekendPackagePrice,
  weekendPackageIncludedKm,
  includedKmPerDay,
  pricePerKm,
  depositAmount,
  minDriverAge,
  minLicenseYears,
  index,
  total,
}: CarPricingPanelProps) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section className="border-t border-[var(--ink-line)] py-24 md:py-32">
      <div className="lux-container">
        <div className="mb-12 max-w-[820px] md:mb-16">
          <SectionCounter index={index} total={total} className="mb-4" />
          <h3 className="font-[family:var(--font-fraunces)] text-[clamp(32px,4vw,52px)] font-light leading-[1] tracking-[-0.025em] text-[var(--ink-ivory)]">
            Les conditions, <em className="italic font-normal">claires.</em>
          </h3>
          <p className="mt-6 max-w-[540px] font-[family:var(--font-dm-sans)] text-[14px] leading-[1.7] text-[var(--ink-text-soft)]">
            Aucun paiement en ligne. Vous soumettez une demande, nous validons,
            le règlement s&apos;effectue à la remise des clés.
          </p>
        </div>

        <div
          ref={ref}
          className="reveal-fade-up mx-auto max-w-[760px] border-b border-[var(--ink-line)]"
        >
          <Row
            label="Tarif jour"
            value={`${pricePerDay.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
            subValue={
              pricePerKm !== null
                ? `+ ${pricePerKm.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} € / km`
                : undefined
            }
            hint="Du lundi au jeudi, sur réservation 1 à 2 semaines à l'avance."
          />
          {weekendPackagePrice !== null && (
            <Row
              label="Forfait week-end 72h"
              value={`${weekendPackagePrice.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
              hint={`Vendredi → lundi${
                weekendPackageIncludedKm
                  ? `, ${weekendPackageIncludedKm} km inclus`
                  : ""
              }.`}
            />
          )}
          {includedKmPerDay !== null && (
            <Row
              label="Kilométrage inclus"
              value={`${includedKmPerDay} km / jour`}
              hint="Facturé au retour selon le compteur."
            />
          )}
          <Row
            label="Caution véhicule"
            value={`${depositAmount.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`}
            hint="Empreinte bancaire — non débitée sauf incident."
          />
          <Row
            label="Conducteur"
            value={`${minDriverAge}+ ans · ${minLicenseYears} ans permis`}
            hint="Permis de conduire en cours de validité, pièce d'identité."
          />
        </div>
      </div>
    </section>
  );
}
