import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

/**
 * Capteurs de tri unifiés, pensés pour le tactile autant que la souris.
 *
 * Le réglage précédent (un seul `PointerSensor`, seuil 6 px) confondait, au
 * doigt, un défilement avec un glissé : impossible de scroller la grille ni de
 * réordonner de façon fiable sur iPad / mobile. On sépare donc par type d'entrée :
 *
 * - **Souris** : activation dès 6 px de déplacement (comportement desktop inchangé).
 * - **Tactile** : appui maintenu 220 ms avec 8 px de tolérance — un glissement
 *   bref fait défiler la page, un appui long démarre le tri (geste de
 *   réorganisation natif iOS/Android). Plus de scroll bloqué.
 * - **Clavier** : réordonnancement accessible aux flèches une fois la poignée
 *   focalisée (Espace/Entrée pour saisir).
 */
export function useSortableSensors() {
  return useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
}
