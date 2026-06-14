/* ============================================================================
   GALERIE D'ACCUEIL — types & ratios d'affichage.

   La galerie n'est plus codée en dur ici : elle est pilotée depuis l'admin
   (/admin/gallery) et lue en base via `getGalleryItems()`
   (src/services/home-gallery.service.ts). Ce fichier ne porte plus que :
     • le type `GalleryItem` consommé par les composants d'affichage,
     • la table de correspondance ratio nommé → (w, h).

   Le couple (w, h) ne définit PAS une taille en pixels — seulement le RATIO
   d'affichage de la tuile (via `aspect-ratio` + `object-cover`). Trois formats
   rythment les colonnes parallaxe : portrait, paysage, carré.

   ORDRE : les médias sont répartis en round-robin (item i → colonne i % n).
   L'ordre est piloté par `displayOrder` côté admin.
   ============================================================================ */

import type { GalleryRatio } from "@prisma/client";

export interface GalleryItem {
  /** Image fixe ou clip vidéo (muet, en boucle, lecture auto en vue). */
  type: "image" | "video";
  /** URL de l'image, ou de la vidéo (.mp4) selon `type`. */
  src: string;
  /**
   * Vidéo uniquement : image affichée avant lecture et quand l'utilisateur
   * a désactivé les animations (`prefers-reduced-motion`). Toujours en fournir
   * une pour ces cas — sinon un fond uni s'affiche.
   */
  poster?: string;
  /** Texte alternatif descriptif (accessibilité). */
  alt: string;
  /** Ratio d'affichage (largeur). */
  w: number;
  /** Ratio d'affichage (hauteur). Avec `w` : portrait si h>w, paysage si w>h. */
  h: number;
}

/** Correspondance ratio nommé (enum Prisma) → couple (w, h) d'aspect-ratio. */
export const GALLERY_RATIOS: Record<GalleryRatio, { w: number; h: number }> = {
  PORTRAIT: { w: 4, h: 5 },
  LANDSCAPE: { w: 3, h: 2 },
  SQUARE: { w: 1, h: 1 },
};

/** Options de format pour les sélecteurs admin (libellé + aperçu du ratio). */
export const GALLERY_RATIO_OPTIONS: {
  value: GalleryRatio;
  label: string;
}[] = [
  { value: "PORTRAIT", label: "Portrait" },
  { value: "LANDSCAPE", label: "Paysage" },
  { value: "SQUARE", label: "Carré" },
];
