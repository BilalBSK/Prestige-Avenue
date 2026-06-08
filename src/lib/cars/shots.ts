/**
 * Prises de vue cataloguées d'un véhicule, par angle.
 *
 * La fiche véhicule n'affiche plus une galerie « à plat » : chaque photo est
 * rattachée à un angle canonique (extérieur 3/4, profil, intérieur poste de
 * conduite, …). L'admin choisit la ou les photos de chaque prise de vue, le
 * studio photo public les présente angle par angle.
 *
 * Stocké dans `Car.galleryShots` (Json) sous la forme
 *   [{ angle: "EXT_THREE_QUARTER", images: ["https://…", …] }, …]
 * Cette source est partagée par l'éditeur admin et l'affichage public, de
 * façon à ce que les deux côtés parlent exactement la même langue.
 */

export type ShotGroup = "EXTERIEUR" | "INTERIEUR";

export type ShotAngle =
  // Extérieur
  | "EXT_THREE_QUARTER"
  | "EXT_FRONT"
  | "EXT_PROFILE"
  | "EXT_REAR"
  | "EXT_WHEELS"
  | "EXT_DETAIL"
  // Intérieur
  | "INT_COCKPIT"
  | "INT_FRONT_SEATS"
  | "INT_DASHBOARD"
  | "INT_DETAIL";

export interface ShotAngleDef {
  angle: ShotAngle;
  group: ShotGroup;
  /** Libellé court (chip / onglet). */
  label: string;
  /** Libellé long (légende studio). */
  caption: string;
  /** Aide affichée dans l'éditeur admin. */
  hint: string;
}

/**
 * Une prise de vue telle que stockée : un angle + ses photos (0..n).
 * Un angle sans photo est simplement masqué côté public.
 */
export interface CarShot {
  angle: ShotAngle;
  images: string[];
}

/** Catalogue ordonné des angles. L'ordre fait foi pour l'affichage. */
export const SHOT_ANGLES: readonly ShotAngleDef[] = [
  {
    angle: "EXT_THREE_QUARTER",
    group: "EXTERIEUR",
    label: "3/4 avant",
    caption: "Trois-quarts avant",
    hint: "La vue signature — capot, flanc et face avant d'un seul regard.",
  },
  {
    angle: "EXT_FRONT",
    group: "EXTERIEUR",
    label: "Face",
    caption: "Face avant",
    hint: "Calandre et signature lumineuse, de face.",
  },
  {
    angle: "EXT_PROFILE",
    group: "EXTERIEUR",
    label: "Profil",
    caption: "Profil",
    hint: "La ligne complète du véhicule, vue de côté.",
  },
  {
    angle: "EXT_REAR",
    group: "EXTERIEUR",
    label: "Arrière",
    caption: "Trois-quarts arrière",
    hint: "Poupe, feux arrière et signature.",
  },
  {
    angle: "EXT_WHEELS",
    group: "EXTERIEUR",
    label: "Jantes",
    caption: "Jantes & trains",
    hint: "Jantes, étriers, montes pneumatiques.",
  },
  {
    angle: "EXT_DETAIL",
    group: "EXTERIEUR",
    label: "Détails ext.",
    caption: "Détails extérieurs",
    hint: "Logos, prises d'air, optiques — les détails de finition.",
  },
  {
    angle: "INT_COCKPIT",
    group: "INTERIEUR",
    label: "Poste de conduite",
    caption: "Poste de conduite",
    hint: "Volant, instrumentation, écrans — la place du conducteur.",
  },
  {
    angle: "INT_FRONT_SEATS",
    group: "INTERIEUR",
    label: "Sièges avant",
    caption: "Sièges avant",
    hint: "Sellerie et assises avant.",
  },
  {
    angle: "INT_DASHBOARD",
    group: "INTERIEUR",
    label: "Planche de bord",
    caption: "Planche de bord",
    hint: "Console centrale, commandes, ambiance intérieure.",
  },
  {
    angle: "INT_DETAIL",
    group: "INTERIEUR",
    label: "Détails int.",
    caption: "Détails intérieurs",
    hint: "Matériaux, surpiqûres, inserts — l'artisanat de l'habitacle.",
  },
] as const;

export const SHOT_GROUPS: { group: ShotGroup; label: string }[] = [
  { group: "EXTERIEUR", label: "Extérieur" },
  { group: "INTERIEUR", label: "Intérieur" },
];

const ANGLE_DEF_BY_KEY = new Map<ShotAngle, ShotAngleDef>(
  SHOT_ANGLES.map((def) => [def.angle, def]),
);

const VALID_ANGLES = new Set<string>(SHOT_ANGLES.map((def) => def.angle));

export function getShotAngleDef(angle: ShotAngle): ShotAngleDef {
  const def = ANGLE_DEF_BY_KEY.get(angle);
  if (!def) throw new Error(`Angle de prise de vue inconnu : ${angle}`);
  return def;
}

/**
 * Normalise une valeur `Car.galleryShots` (Json libre, venue de la DB ou d'un
 * formulaire) en une liste de prises de vue valides, dans l'ordre canonique du
 * catalogue. Tolérant : ignore tout angle inconnu, déduplique les URLs, retire
 * les entrées vides. Ne lève jamais — sûr à appeler avec n'importe quelle
 * entrée non fiable.
 */
export function parseShots(raw: unknown): CarShot[] {
  if (!Array.isArray(raw)) return [];

  const byAngle = new Map<ShotAngle, string[]>();
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const obj = entry as Record<string, unknown>;
    const angle = obj.angle;
    if (typeof angle !== "string" || !VALID_ANGLES.has(angle)) continue;
    if (!Array.isArray(obj.images)) continue;
    const images = obj.images
      .filter((u): u is string => typeof u === "string" && u.trim().length > 0)
      .map((u) => u.trim());
    if (images.length === 0) continue;
    const key = angle as ShotAngle;
    const existing = byAngle.get(key) ?? [];
    byAngle.set(key, [...existing, ...images]);
  }

  const shots: CarShot[] = [];
  for (const def of SHOT_ANGLES) {
    const images = byAngle.get(def.angle);
    if (!images || images.length === 0) continue;
    // Déduplication en préservant l'ordre.
    shots.push({ angle: def.angle, images: Array.from(new Set(images)) });
  }
  return shots;
}

/** Aplatit les prises de vue en une liste d'URLs ordonnée (légendes incluses). */
export interface FlatShot {
  url: string;
  angle: ShotAngle;
  group: ShotGroup;
  label: string;
  caption: string;
}

export function flattenShots(shots: CarShot[]): FlatShot[] {
  const flat: FlatShot[] = [];
  for (const shot of shots) {
    const def = ANGLE_DEF_BY_KEY.get(shot.angle);
    if (!def) continue;
    for (const url of shot.images) {
      flat.push({
        url,
        angle: def.angle,
        group: def.group,
        label: def.label,
        caption: def.caption,
      });
    }
  }
  return flat;
}

/**
 * Repli : convertit une galerie « à plat » héritée (`galleryImages`) en prises
 * de vue affichables, toutes rangées sous un angle générique « Extérieur ».
 * Permet aux véhicules pas encore re-catalogués de continuer à s'afficher.
 */
export function shotsFromLegacyGallery(images: string[]): FlatShot[] {
  const clean = images.filter((u) => typeof u === "string" && u.trim().length > 0);
  return clean.map((url) => ({
    url,
    angle: "EXT_THREE_QUARTER",
    group: "EXTERIEUR",
    label: "Galerie",
    caption: "Galerie",
  }));
}
