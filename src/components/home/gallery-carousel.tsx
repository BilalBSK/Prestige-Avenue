"use client";

import { useEffect, useRef } from "react";
import type { GalleryItem } from "@/lib/home/gallery-items";
import { GalleryTile } from "./gallery-tile";

/**
 * Mode carrousel horizontal — mobile (< 640px).
 *
 * Les tuiles, empilées, feraient plusieurs milliers de px de haut sur un
 * téléphone. On les pose donc en bande horizontale à défilement par accroche :
 * une tuile par écran avec un aperçu (« peek ») de la suivante, et une fine
 * barre de progression or sous la bande.
 *
 * Sur mobile Lenis est désactivé (écran tactile) : le défilement tactile natif
 * suffit, inutile d'ajouter une logique de glissé. La progression est écrite
 * directement via une ref (pas de re-render à chaque pixel de scroll).
 */
export function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const onScroll = () => {
      const max = scroller.scrollWidth - scroller.clientWidth;
      const progress = max > 0 ? scroller.scrollLeft / max : 0;
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
      }
    };

    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="gallery-carousel-scroller -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1"
        style={{ scrollbarWidth: "none", touchAction: "pan-x pan-y" }}
        aria-label="Galerie, faites défiler horizontalement"
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="w-[82%] flex-shrink-0 snap-center first:ml-0"
          >
            <GalleryTile item={item} revealDelay={index * 70} ratio="4 / 5" />
          </div>
        ))}
      </div>

      {/* --- Barre de progression : piste fine + remplissage or piloté en scroll --- */}
      <div className="mt-5 px-1">
        <span className="relative block h-px w-full overflow-hidden bg-[var(--ink-line-soft)]">
          <span
            ref={fillRef}
            aria-hidden
            className="absolute inset-y-0 left-0 w-full origin-left"
            style={{
              transform: "scaleX(0)",
              background:
                "linear-gradient(90deg, var(--gold-deep), var(--gold) 55%, var(--gold-soft))",
            }}
          />
        </span>
      </div>

      <style>{`
        .gallery-carousel-scroller::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
