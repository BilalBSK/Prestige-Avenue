"use client";

import type { ButtonHTMLAttributes } from "react";

/**
 * Poignée de glissé dédiée pour les grilles triables (dnd-kit).
 *
 * Pourquoi une poignée plutôt que l'image entière comme zone de saisie : au
 * doigt, faire de toute la vignette la poignée empêchait de scroller la grille.
 * En isolant la saisie sur cette poignée — toujours visible, marquée
 * `touch-none` pour réserver le geste au tri — un glissement ailleurs continue
 * de faire défiler la page, tandis qu'un appui maintenu sur la poignée réordonne.
 *
 * Reçoit `attributes` + `listeners` de `useSortable` via les props natives du
 * bouton. Cible tactile portée à 44 px (`coarse:`) conformément aux standards.
 */
export function DragHandle({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Réordonner — maintenir puis glisser"
      title="Réordonner"
      className={`flex h-7 w-7 cursor-grab touch-none items-center justify-center rounded-md bg-black/65 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/80 active:cursor-grabbing coarse:h-9 coarse:w-9 ${className}`}
      {...props}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <circle cx="5" cy="3" r="1" fill="currentColor" />
        <circle cx="9" cy="3" r="1" fill="currentColor" />
        <circle cx="5" cy="7" r="1" fill="currentColor" />
        <circle cx="9" cy="7" r="1" fill="currentColor" />
        <circle cx="5" cy="11" r="1" fill="currentColor" />
        <circle cx="9" cy="11" r="1" fill="currentColor" />
      </svg>
    </button>
  );
}
