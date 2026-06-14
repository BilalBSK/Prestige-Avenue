"use client";

import { useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/home/gallery-items";
import { GalleryParallax } from "./gallery-parallax";
import { GalleryCarousel } from "./gallery-carousel";

type Mode = "carousel" | "two" | "three";

/**
 * Sélecteur de présentation de la galerie selon la largeur d'écran :
 *   • < 640px  → carrousel horizontal (swipe) — évite une colonne de ~3000px
 *   • < 1024px → parallaxe 2 colonnes
 *   • ≥ 1024px → parallaxe 3 colonnes
 *
 * Un SEUL mode est monté à la fois : le mode parallaxe fait tourner des hooks
 * `useScroll`/`useTransform` qu'on ne veut pas exécuter sur mobile. Le défaut
 * SSR est "three" (desktop) ; la largeur réelle est lue après montage — un
 * simple changement d'état post-hydratation, sans mismatch.
 */
export function GalleryShowcase({ items }: { items: GalleryItem[] }) {
  const [mode, setMode] = useState<Mode>("three");

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      setMode(w < 640 ? "carousel" : w < 1024 ? "two" : "three");
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  if (mode === "carousel") return <GalleryCarousel items={items} />;
  return <GalleryParallax items={items} columnCount={mode === "two" ? 2 : 3} />;
}
