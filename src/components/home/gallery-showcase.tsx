"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { GALLERY_ITEMS } from "@/lib/home/gallery-items";
import { GalleryTile } from "./gallery-tile";

/**
 * Vitrine « colonnes parallaxe ».
 *
 * La grille est composée de colonnes EXPLICITES (1 / 2 / 3 selon l'écran) :
 * chaque colonne dérive verticalement à une vitesse propre au défilement, ce
 * qui crée une vraie profondeur. La dérive est pilotée par des `MotionValue`
 * (transform GPU, zéro re-render React) et complètement neutralisée si
 * l'utilisateur a désactivé les animations.
 *
 * Les médias sont répartis en round-robin (item i → colonne i % n), ce qui
 * préserve l'ordre de lecture et équilibre les hauteurs des colonnes.
 */
export function GalleryShowcase() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(3); // défaut desktop = SSR

  // Nombre de colonnes selon la largeur. Défaut 3 = rendu serveur ; mis à jour
  // après montage (pas de mismatch d'hydratation, simple update post-montage).
  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setColumnCount(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // Progression du défilement sur la section (0 = section entre par le bas,
  // 1 = elle sort par le haut). Sert d'horloge à la parallaxe.
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
            // La dérive ne s'applique qu'au-delà d'une colonne (sur 1 colonne,
            // la parallaxe n'a pas de sens et créerait un vide).
            style={columnCount > 1 ? { y: columnY[colIndex] } : undefined}
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
