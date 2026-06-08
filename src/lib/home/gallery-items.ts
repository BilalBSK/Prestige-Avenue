/* ============================================================================
   GALERIE D'ACCUEIL — contenu (données de test, à remplacer).

   C'EST LE SEUL FICHIER À ÉDITER pour changer les visuels de la galerie.
   Chaque entrée est une tuile de la grille « colonnes parallaxe ».

   Pour brancher les vrais médias du client, remplacez `src` (et `poster`
   pour les vidéos) par :
     • une URL hébergée sur le stockage R2 (recommandé en production), ou
     • un chemin local dans /public (ex: "/gallery/audi-rs6-avant.jpg").

   Le couple (w, h) ne définit PAS la taille en pixels — seulement le RATIO
   d'affichage de la tuile (via `aspect-ratio` + `object-cover`). Variez-le
   (portrait 4/5, paysage 3/2, carré 1/1…) pour conserver le rythme éditorial
   et l'équilibre des colonnes. Le domaine images.unsplash.com et le bucket R2
   sont déjà autorisés dans next.config.ts.

   ORDRE : les médias sont répartis en round-robin (item i → colonne i % n).
   L'ordre ci-dessous place donc un clip vidéo dans chaque colonne (desktop)
   plutôt que de les empiler — gardez cet entrelacement si vous réorganisez.
   ============================================================================ */

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

/** Petit util pour des URLs Unsplash homogènes (placeholder de test). */
const u = (id: string, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const GALLERY_ITEMS: GalleryItem[] = [
  // — colonne 0 —
  {
    type: "video",
    src: "/video/background.mp4",
    poster: u("1503376780353-7e6692767b70", 1600),
    alt: "Berline de prestige en mouvement, lumière basse",
    w: 16,
    h: 10,
  },
  // — colonne 1 —
  {
    type: "image",
    src: u("1493238792000-8113da705763", 1400),
    alt: "Feu arrière allumé d'une voiture de sport à la tombée du jour",
    w: 3,
    h: 2,
  },
  // — colonne 2 —
  {
    type: "video",
    src: "/video/background2.mp4",
    poster: u("1517994112540-009c47ea476b", 1200),
    alt: "Face avant d'une voiture de sport, éclairage tamisé",
    w: 1,
    h: 1,
  },
  // — colonne 0 —
  {
    type: "image",
    src: u("1555215695-3004980ad54e", 1000),
    alt: "Coupé sportif de profil, carrosserie sombre",
    w: 4,
    h: 5,
  },
  // — colonne 1 —
  {
    type: "video",
    src: "/video/background3.mp4",
    poster: u("1494976388531-d1058494cdd8", 1200),
    alt: "Détail de carrosserie filmé en lumière rasante",
    w: 4,
    h: 5,
  },
  // — colonne 2 —
  {
    type: "image",
    src: u("1552519507-da3b142c6e3d", 1400),
    alt: "Voiture de sport en extérieur à la tombée du jour",
    w: 3,
    h: 2,
  },
  // — colonne 0 —
  {
    type: "image",
    src: u("1583121274602-3e2820c69888", 1000),
    alt: "Supercar à l'arrêt, reflets nocturnes",
    w: 4,
    h: 5,
  },
  // — colonne 1 —
  {
    type: "image",
    src: u("1494976388531-d1058494cdd8", 1400),
    alt: "Voiture de collection, traitement sombre et sculptural",
    w: 3,
    h: 2,
  },
];
