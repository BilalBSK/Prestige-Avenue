"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { GALLERY_ITEMS } from "@/lib/home/gallery-items";
import { GalleryTile } from "./gallery-tile";

interface GalleryParallaxProps {
  /** 2 (tablette) ou 3 (desktop) colonnes. */
  columnCount: 2 | 3;
}

/**
 * Mode « colonnes parallaxe » — tablette & desktop.
 *
 * Colonnes EXPLICITES dérivant chacune à une vitesse propre au défilement
 * (vraie profondeur). La dérive est pilotée par des `MotionValue` (transform
 * GPU, zéro re-render) et neutralisée si l'utilisateur préfère moins de
 * mouvement. Médias répartis en round-robin (item i → colonne i % n) : l'ordre
 * de lecture est préservé et les hauteurs des colonnes s'équilibrent.
 */
export function GalleryParallax({ columnCount }: GalleryParallaxProps) {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Progression du défilement sur la section (0 = entre par le bas,
  // 1 = sort par le haut). Sert d'horloge à la parallaxe.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Trois dérives distinctes — magnitude modérée (≤ ~70px) : comme le fond est
  // uniforme, aucun vide n'apparaît aux extrémités. Sens alternés = profondeur.
  // Neutralisées (plage [0,0]) si l'utilisateur préfère moins de mouvement.
  const r = (a: number, b: number): [number, number] =>
    prefersReduced ? [0, 0] : [a, b];
  const y0 = useTransform(scrollYProgress, [0, 1], r(52, -52));
  const y1 = useTransform(scrollYProgress, [0, 1], r(-66, 58));
  const y2 = useTransform(scrollYProgress, [0, 1], r(34, -48));
  const columnY = [y0, y1, y2];

  // Répartition round-robin dans le nombre de colonnes courant.
  const columns: (typeof GALLERY_ITEMS)[number][][] = Array.from(
    { length: columnCount },
    () => [],
  );
  GALLERY_ITEMS.forEach((item, index) => {
    columns[index % columnCount].push(item);
  });

  return (
    <div ref={sectionRef} className="relative">
      <div className="flex items-start gap-3 sm:gap-4 md:gap-5">
        {columns.map((column, colIndex) => (
          <motion.div
            key={colIndex}
            style={{ y: columnY[colIndex] }}
            className="flex flex-1 flex-col gap-3 sm:gap-4 md:gap-5"
          >
            {column.map((item, rowIndex) => (
              <GalleryTile
                key={`${colIndex}-${rowIndex}`}
                item={item}
                revealDelay={rowIndex * 90 + colIndex * 50}
              />
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
