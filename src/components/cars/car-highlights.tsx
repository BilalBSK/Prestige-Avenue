"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";

interface CarHighlightsProps {
  highlights: string[];
  /** Image d'illustration de la section (vue intérieure de préférence). */
  image: string;
  /** Légende courte de l'image (angle de prise de vue ou modèle). */
  imageCaption: string;
  brand: string;
  model: string;
}

/**
 * Section « Sélection — Ce qui la rend remarquable ».
 *
 * Layout éditorial split : image d'illustration épinglée (sticky) à gauche, liste
 * numérotée des points à droite. Sur mobile, une seule colonne (image puis liste,
 * sans sticky).
 *
 * Deux couches d'animation, soigneusement séparées — exactement comme la galerie
 * d'accueil :
 *   1. Révélation à l'entrée — pilotée par `useRevealOnScroll` + les classes CSS
 *      `.reveal-*` (le système éprouvé du site, avec repli `prefers-reduced-motion`
 *      intégré). C'est ce qui rend le contenu VISIBLE : jamais conditionné à une
 *      animation JS.
 *   2. Parallaxe de l'image — framer-motion `useScroll`/`useTransform`. Ne fait que
 *      DÉCALER une image déjà visible ; ne peut donc jamais la masquer.
 */
export function CarHighlights({
  highlights,
  image,
  imageCaption,
  brand,
  model,
}: CarHighlightsProps) {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  // Révélation de la liste (IntersectionObserver) — le système éprouvé du site.
  // L'IMAGE, elle, n'est jamais conditionnée à une animation : visible par
  // défaut, seulement décalée par la parallaxe (cf. plus bas).
  const listRef = useRevealOnScroll<HTMLUListElement>({ threshold: 0.2 });

  // Horloge de parallaxe : 0 quand la section entre par le bas, 1 quand elle
  // sort par le haut. Pilote la légère dérive verticale de l'image.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  // L'image est sur-cadrée (scale 1.12 → ~6 % de marge de chaque côté) : une
  // dérive de ±5 % reste sans bord visible. Neutralisée sous reduced-motion.
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReduced ? ["0%", "0%"] : ["5%", "-5%"],
  );

  if (highlights.length === 0) return null;

  return (
    <section ref={sectionRef} className="lux-container py-24 md:py-32">
      <div className="mb-12 max-w-[680px] md:mb-16">
        <p className="lux-eyebrow mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em]">
          — Sélection
        </p>
        <h3 className="font-[family:var(--font-fraunces)] text-[clamp(28px,3.5vw,44px)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--ink-ivory)]">
          Ce qui la rend <em className="italic font-normal">remarquable.</em>
        </h3>
      </div>

      <div className="grid gap-10 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)] md:gap-14 lg:gap-20">
        {/* Colonne image — épinglée sur desktop, dégage la barre de réservation. */}
        <div className="md:sticky md:top-[120px] md:self-start">
          <div className="group/frame relative aspect-[16/10] w-full overflow-hidden border border-[var(--ink-line)] bg-[var(--ink-elevated)] md:aspect-[4/5]">
            {/* Calque image — sur-cadrage + parallaxe au scroll. Visible par
                défaut (framer-motion ne fait que le translater). */}
            <motion.div style={{ y: imageY, scale: 1.12 }} className="absolute inset-0">
              <Image
                src={image}
                alt={`${brand} ${model} — ${imageCaption}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1152px) 42vw, 480px"
                quality={85}
                draggable={false}
              />
            </motion.div>

            {/* Voile dégradé — ancre la légende, donne de la profondeur. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.32)_0%,transparent_30%,transparent_55%,rgba(5,5,5,0.82)_100%)]"
            />
            {/* Grain léger — même recette que le studio photo, pour la cohérence. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
              }}
            />

            {/* Légende (bas gauche) — filet doré « effet bijou » + libellé. */}
            <div className="pointer-events-none absolute bottom-5 left-5 right-5 z-10 md:bottom-6 md:left-6">
              <span aria-hidden className="gold-rule mb-3 block w-9" />
              <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-text-soft)]">
                {brand}
              </p>
              <p className="mt-1.5 font-[family:var(--font-fraunces)] text-[clamp(18px,2.2vw,24px)] font-light italic leading-none tracking-[-0.01em] text-[var(--ink-ivory)]">
                {imageCaption}
              </p>
            </div>
          </div>
        </div>

        {/* Colonne liste — items en cascade, filet qui se trace, flèche au hover. */}
        <ul ref={listRef} className="reveal-stagger flex flex-col">
          {highlights.map((item, i) => (
            <li key={`${item}-${i}`} className="group relative">
              {/* Filet supérieur tracé via la classe `.reveal-line` du site. */}
              <span
                aria-hidden
                className="reveal-line block h-px w-full bg-[var(--ink-line)]"
              />
              <div className="flex items-baseline gap-5 py-7 md:gap-7 md:py-8">
                <span className="shrink-0 font-[family:var(--font-fraunces)] text-[14px] italic text-[var(--ink-dim)] transition-colors duration-300 group-hover:text-[var(--gold)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="flex-1 font-[family:var(--font-fraunces)] text-[clamp(17px,1.5vw,20px)] font-light leading-[1.45] text-[var(--ink-text)] transition-colors duration-300 group-hover:text-[var(--ink-ivory)]">
                  {item}
                </p>
                <span
                  aria-hidden
                  className="shrink-0 self-center font-[family:var(--font-fraunces)] text-[18px] italic text-[var(--gold)] opacity-0 transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1 group-hover:opacity-100"
                >
                  →
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
