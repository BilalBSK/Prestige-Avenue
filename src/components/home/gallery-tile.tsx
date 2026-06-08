"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { GalleryItem } from "@/lib/home/gallery-items";

interface GalleryTileProps {
  item: GalleryItem;
  /** Délai d'entrée (ms) pour échelonner la révélation par colonne. */
  revealDelay?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Une tuile de la galerie « colonnes parallaxe ».
 *
 * Deux couches d'animation, soigneusement séparées :
 *   1. Entrée  — `whileInView` (opacity / y / blur), jouée une seule fois.
 *   2. Survol  — zoom lent du média + liseré or, piloté en CSS (group-hover) ;
 *                pure respiration visuelle, la tuile n'est pas cliquable.
 *
 * Les vidéos jouent en boucle, muettes, et UNIQUEMENT quand elles sont à
 * l'écran (IntersectionObserver) — et se figent sur leur poster si l'onglet
 * passe en arrière-plan ou si `prefers-reduced-motion` est actif.
 */
export function GalleryTile({ item, revealDelay = 0 }: GalleryTileProps) {
  const prefersReduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Lecture auto en vue : on ne joue la vidéo que lorsqu'elle est visible, et on
  // la met en pause hors-champ + quand l'onglet est masqué (perf / batterie).
  useEffect(() => {
    if (item.type !== "video" || prefersReduced) return;
    const node = videoRef.current;
    if (!node) return;

    let inView = false;
    const sync = () => {
      if (inView && !document.hidden) {
        node.play().catch(() => {});
      } else {
        node.pause();
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        sync();
      },
      { threshold: 0.25 },
    );
    io.observe(node);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [item.type, prefersReduced]);

  // Une vidéo se réduit à son poster si l'utilisateur a désactivé les animations.
  const showStaticPoster = item.type === "video" && prefersReduced;

  return (
    <motion.div
      initial={
        prefersReduced
          ? { opacity: 0 }
          : { opacity: 0, y: 32, filter: "blur(12px)" }
      }
      whileInView={
        prefersReduced
          ? { opacity: 1 }
          : { opacity: 1, y: 0, filter: "blur(0px)" }
      }
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{
        duration: prefersReduced ? 0.4 : 1,
        ease: EASE,
        delay: revealDelay / 1000,
      }}
      className="group/tile relative block w-full overflow-hidden rounded-xl bg-[var(--ink-elevated)]"
      style={{ aspectRatio: `${item.w} / ${item.h}` }}
    >
      {/* --- Média : zoom lent au survol (couche interne) --- */}
      <div className="absolute inset-0 transition-transform duration-[1300ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover/tile:scale-[1.06]">
        {item.type === "image" || showStaticPoster ? (
          <Image
            src={item.type === "image" ? item.src : (item.poster as string)}
            alt={item.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            quality={85}
          />
        ) : (
          <video
            ref={videoRef}
            poster={item.poster}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={item.alt}
            className="h-full w-full object-cover"
          >
            <source src={item.src} type="video/mp4" />
          </video>
        )}
      </div>

      {/* --- Voile dégradé bas : ancre le regard, donne du volume --- */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(5,5,5,0.45)_100%)] opacity-70 transition-opacity duration-500 group-hover/tile:opacity-90"
      />

      {/* --- Liseré or intérieur, révélé au survol (effet bijou mesuré).
          Le ring de Tailwind est un box-shadow : on anime donc box-shadow. --- */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-[rgba(201,162,78,0)] transition-shadow duration-500 group-hover/tile:ring-[rgba(201,162,78,0.38)]"
      />

      {/* --- Glyphe « clip vidéo », coin bas-gauche, discret --- */}
      {item.type === "video" && !showStaticPoster ? (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-[rgba(5,5,5,0.45)] px-2.5 py-1 backdrop-blur-md"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--gold)]" />
          <span className="font-[family:var(--font-dm-sans)] text-[9px] font-medium uppercase tracking-[0.2em] text-[var(--ink-text-soft)]">
            Clip
          </span>
        </span>
      ) : null}
    </motion.div>
  );
}
