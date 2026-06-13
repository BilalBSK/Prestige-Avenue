import { GalleryShowcase } from "./gallery-showcase";

/**
 * Galerie — respiration visuelle entre la Flotte et le Processus.
 *
 * Volontairement NON numérotée (pas de SectionCounter ni d'entrée dans le
 * ScrollLegend) : c'est une respiration visuelle, pas une étape du parcours.
 * Composant serveur fin qui pose un en-tête minimal et délègue l'interactivité
 * (grille parallaxe desktop / carrousel mobile, lecture vidéo en vue) à l'îlot
 * client `GalleryShowcase`. Aucun texte n'est posé sur les visuels eux-mêmes.
 */
export function GallerySection() {
  return (
    <section id="galerie" className="gallery relative overflow-hidden py-20 md:py-40">
      {/* Halo radial très diffus : ancre la grille, donne de la profondeur sans
          jamais devenir une « couleur de fond ». Pur décor, masqué aux AT. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[70vh] w-[120vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(201,162,78,0.05),transparent_62%)]"
      />

      <div className="lux-container relative">
        <header className="mb-10 flex flex-col items-start gap-5 md:mb-14 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="max-w-[640px]">
            <span className="lux-eyebrow inline-block font-[family:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em]">
              Galerie
            </span>
            <h2 className="mt-5 font-[family:var(--font-fraunces)] text-[clamp(40px,5vw,56px)] font-light leading-none tracking-[-0.025em] text-[var(--ink-ivory)]">
              <em>Notre univers</em>
            </h2>
          </div>
        </header>

        <GalleryShowcase />
      </div>
    </section>
  );
}
