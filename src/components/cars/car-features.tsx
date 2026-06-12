"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import type { FlatShot } from "@/lib/cars/shots";

interface Feature {
  title: string;
  body: string;
}

interface CarFeaturesProps {
  features: Feature[];
  /**
   * Pool d'images à apparier aux paragraphes. On réutilise les prises de vue du
   * studio (la fiche ne stocke pas d'image par équipement) — exactement la même
   * source que la section « Sélection ». Peut être vide : repli sur `mainImage`.
   */
  shots: FlatShot[];
  /** Image principale — repli garanti (toujours présente). */
  mainImage: string;
  brand: string;
  model: string;
}

/** Courbe d'accélération signature du site (entrées et zooms). */
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Section « Détails techniques — Sous le capot ».
 *
 * Présentation éditoriale en rangées alternées : chaque paragraphe est apparié
 * à une image, côté gauche puis côté droit, en alternance. Sur mobile, l'image
 * passe au-dessus du texte (une seule colonne).
 *
 * Deux couches d'animation soigneusement séparées — même grammaire que la
 * section « Sélection » (`CarHighlights`) et la galerie d'accueil :
 *   1. Entrée  — `whileInView` : l'image glisse depuis SON côté (gauche pour les
 *      rangées paires, droite pour les impaires), le texte monte en cascade
 *      juste après (léger décalage = profondeur). Joué une seule fois.
 *   2. Parallaxe — `useScroll`/`useTransform` par rangée : l'image, sur-cadrée
 *      (scale 1.12), dérive de ±5 % au défilement. Ne fait que DÉCALER une image
 *      déjà visible ; ne peut donc jamais la masquer.
 * Tout est neutralisé sous `prefers-reduced-motion`.
 */
export function CarFeatures({ features, shots, mainImage, brand, model }: CarFeaturesProps) {
  const headerRef = useRevealOnScroll<HTMLDivElement>({ threshold: 0.3 });
  if (features.length === 0) return null;

  return (
    <section className="overflow-x-clip border-y border-[var(--ink-line)] bg-[var(--ink-surface)] py-24 md:py-32">
      <div className="lux-container">
        <div
          ref={headerRef}
          className="reveal-fade-up mb-16 max-w-[820px] md:mb-24"
        >
          <p className="lux-eyebrow mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em]">
            — Détails techniques
          </p>
          <h3 className="font-[family:var(--font-fraunces)] text-[clamp(32px,4vw,52px)] font-light leading-[1] tracking-[-0.025em] text-[var(--ink-ivory)]">
            Sous le <em className="italic font-normal">capot.</em>
          </h3>
        </div>

        <div className="flex flex-col gap-20 md:gap-28 lg:gap-32">
          {features.map((feature, i) => {
            // Appariement déterministe : on cycle sur les prises de vue
            // disponibles ; à défaut (véhicule sans studio), repli sur l'image
            // principale. Garantit un visuel non vide pour chaque paragraphe.
            const shot = shots.length > 0 ? shots[i % shots.length] : null;
            return (
              <FeatureRow
                key={`${feature.title}-${i}`}
                index={i}
                feature={feature}
                imageUrl={shot?.url ?? mainImage}
                imageCaption={shot?.caption ?? `${brand} ${model}`}
                brand={brand}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

interface FeatureRowProps {
  index: number;
  feature: Feature;
  imageUrl: string;
  imageCaption: string;
  brand: string;
}

function FeatureRow({ index, feature, imageUrl, imageCaption, brand }: FeatureRowProps) {
  const prefersReduced = useReducedMotion();
  const rowRef = useRef<HTMLElement>(null);

  // Horloge de parallaxe propre à la rangée : 0 quand elle entre par le bas,
  // 1 quand elle sort par le haut.
  const { scrollYProgress } = useScroll({
    target: rowRef,
    offset: ["start end", "end start"],
  });
  // Sur-cadrage scale 1.12 → ~6 % de marge de chaque côté : une dérive de ±5 %
  // reste sans bord visible. Neutralisée sous reduced-motion.
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReduced ? ["0%", "0%"] : ["5%", "-5%"],
  );

  // Rangées paires : image à gauche. Impaires : image à droite. L'image entre en
  // glissant depuis son propre côté.
  const imageLeft = index % 2 === 0;
  const fromX = prefersReduced ? 0 : imageLeft ? -56 : 56;

  // Cascade du texte (numéro → titre → corps) — léger décalage après l'image.
  const textContainer = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: prefersReduced ? 0 : 0.14 },
    },
  };
  const textItem = {
    hidden: prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: prefersReduced ? 0.4 : 0.7, ease: EASE },
    },
  };

  return (
    <article
      ref={rowRef}
      className="group grid items-center gap-8 md:grid-cols-2 md:gap-14 lg:gap-20"
    >
      {/* Colonne image — glisse depuis son côté à l'entrée. */}
      <motion.div
        initial={
          prefersReduced
            ? { opacity: 0 }
            : { opacity: 0, x: fromX, filter: "blur(14px)" }
        }
        whileInView={
          prefersReduced
            ? { opacity: 1 }
            : { opacity: 1, x: 0, filter: "blur(0px)" }
        }
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        transition={{ duration: prefersReduced ? 0.4 : 1, ease: EASE }}
        className={imageLeft ? "md:order-1" : "md:order-2"}
      >
        <div className="group/frame relative aspect-[4/3] w-full overflow-hidden border border-[var(--ink-line)] bg-[var(--ink-elevated)]">
          {/* Calque parallaxe — ne translate que verticalement (GPU). */}
          <motion.div
            style={{ y: imageY }}
            className="absolute inset-0 will-change-transform"
          >
            {/* Calque sur-cadrage + zoom lent au survol (couche CSS séparée :
                aucun conflit de transform avec la parallaxe). */}
            <div className="absolute inset-0 scale-[1.12] transition-transform duration-[1300ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover/frame:scale-[1.17]">
              <Image
                src={imageUrl}
                alt={`${brand} — ${imageCaption}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1152px) 48vw, 560px"
                quality={85}
                draggable={false}
              />
            </div>
          </motion.div>

          {/* Voile dégradé — ancre la légende, donne de la profondeur. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.30)_0%,transparent_32%,transparent_58%,rgba(5,5,5,0.80)_100%)]"
          />
          {/* Grain léger — même recette que le studio / la sélection. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.05]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence baseFrequency='1.4'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.45'/></svg>\")",
            }}
          />
          {/* Liseré or intérieur révélé au survol — « effet bijou » mesuré. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[rgba(201,162,78,0)] transition-shadow duration-500 group-hover/frame:ring-[rgba(201,162,78,0.34)]"
          />

          {/* Légende (bas gauche) — filet doré + angle de prise de vue. */}
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
      </motion.div>

      {/* Colonne texte — cascade numéro → titre → corps, après l'image. */}
      <motion.div
        variants={textContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "0px 0px -12% 0px" }}
        className={imageLeft ? "md:order-2" : "md:order-1"}
      >
        <motion.div variants={textItem}>
          <span aria-hidden className="gold-rule mb-6 block w-10" />
          <span className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
            {String(index + 1).padStart(2, "0")}
          </span>
        </motion.div>
        <motion.h4
          variants={textItem}
          className="mt-4 font-[family:var(--font-fraunces)] text-[22px] font-light leading-[1.2] tracking-[-0.01em] text-[var(--ink-ivory)]"
        >
          {feature.title}
        </motion.h4>
        <motion.p
          variants={textItem}
          className="mt-4 max-w-[46ch] font-[family:var(--font-dm-sans)] text-[14px] leading-[1.7] text-[var(--ink-text-soft)]"
        >
          {feature.body}
        </motion.p>
      </motion.div>
    </article>
  );
}
