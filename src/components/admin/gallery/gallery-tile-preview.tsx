"use client";

import Image from "next/image";
import type { GalleryMediaType, GalleryRatio } from "@prisma/client";
import { GALLERY_RATIOS } from "@/lib/home/gallery-items";

interface GalleryTilePreviewProps {
  mediaType: GalleryMediaType;
  /** URL du média (image, ou vidéo si mediaType === VIDEO). */
  src: string | null;
  /** Vidéo : image de couverture. */
  poster: string | null;
  alt: string;
  ratio: GalleryRatio;
  /**
   * `true` (éditeur) : lit réellement la vidéo, muette et en boucle, pour un
   * aperçu fidèle du mouvement. `false` (grille) : fige sur le poster — léger,
   * et représentatif du rendu sous prefers-reduced-motion.
   */
  live?: boolean;
  /** Tailles passées à next/image (perf). */
  sizes?: string;
  className?: string;
}

/**
 * Aperçu fidèle d'une tuile de galerie telle qu'elle s'affichera sur l'accueil :
 * vrai ratio, recadrage `object-cover`, voile dégradé bas et liseré or au survol
 * (l'« effet bijou » du site). Sert à la fois de vignette dans la grille admin
 * et d'aperçu live dans le tiroir d'édition — l'admin voit exactement le rendu.
 */
export function GalleryTilePreview({
  mediaType,
  src,
  poster,
  alt,
  ratio,
  live = false,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  className = "",
}: GalleryTilePreviewProps) {
  const { w, h } = GALLERY_RATIOS[ratio];
  const isVideo = mediaType === "VIDEO";
  // Image à afficher en mode figé : la source pour une image, le poster pour une vidéo.
  const stillSrc = isVideo ? poster : src;

  return (
    <div
      className={`group/preview relative overflow-hidden rounded-xl bg-[color:var(--admin-surface-2)] ${className}`}
      style={{ aspectRatio: `${w} / ${h}` }}
    >
      {/* --- Média : zoom lent au survol (couche interne), comme la tuile publique --- */}
      <div className="absolute inset-0 transition-transform duration-[1300ms] ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform group-hover/preview:scale-[1.06]">
        {isVideo && live && src ? (
          <video
            src={src}
            poster={poster ?? undefined}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            aria-label={alt}
            className="h-full w-full object-cover"
          />
        ) : stillSrc ? (
          <Image src={stillSrc} alt={alt} fill sizes={sizes} className="object-cover" />
        ) : (
          // Aucun média encore choisi : placeholder discret.
          <div className="flex h-full w-full items-center justify-center text-[color:var(--admin-text-muted)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="m3.5 16.5 4.5-4 3.5 3 3-2.5 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* --- Voile dégradé bas : ancre le regard, donne du volume --- */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(5,5,5,0.45)_100%)] opacity-70 transition-opacity duration-500 group-hover/preview:opacity-90"
      />

      {/* --- Liseré or intérieur, révélé au survol (effet bijou mesuré) --- */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-[rgba(228,179,99,0)] transition-shadow duration-500 group-hover/preview:ring-[rgba(228,179,99,0.4)]"
      />
    </div>
  );
}
