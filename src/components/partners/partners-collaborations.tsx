import { getCollaborationSlides } from "@/services/collaboration.service";
import { CollaborationsCarousel } from "./collaborations-carousel";

export async function PartnersCollaborations() {
  const slides = await getCollaborationSlides();
  if (slides.length === 0) return null;

  return (
    <section className="overflow-hidden border-b border-[var(--ink-line)] bg-[var(--ink-onyx)] py-20 md:py-28">
      <div className="lux-container mb-10 md:mb-12">
        <p className="lux-eyebrow mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em]">
          — Ils roulent avec nous
        </p>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
          <h2 className="max-w-[680px] font-[family:var(--font-fraunces)] text-[clamp(32px,4vw,52px)] font-light leading-[1] tracking-[-0.025em] text-[var(--ink-ivory)]">
            Apercu de nos collaborations
          </h2>
        </div>
      </div>

      {/* Pleine largeur, débordant volontairement du conteneur pour l'effet ruban. */}
      <CollaborationsCarousel slides={slides} />
    </section>
  );
}
