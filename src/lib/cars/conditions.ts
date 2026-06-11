/**
 * Conditions de location d'un véhicule, entièrement pilotées par l'admin.
 *
 * Elles remplacent les anciens champs rigides `minDriverAge` / `minLicenseYears` :
 * chaque véhicule porte désormais sa propre liste de conditions (âge minimum,
 * ancienneté du permis, pièces à fournir, conducteur additionnel, …). L'admin
 * ajoute, modifie, supprime et réordonne librement ces conditions ; la fiche
 * publique les affiche telles quelles, dans le panneau « Les conditions, claires ».
 *
 * Stocké dans `Car.rentalConditions` (Json) sous la forme
 *   [{ label: "Conducteur", value: "21+ ans", hint: "…" }, …]
 * Cette source est partagée par l'éditeur admin et l'affichage public, pour que
 * les deux côtés parlent exactement la même langue (cf. src/lib/cars/shots.ts).
 */

/**
 * Une condition de location : un intitulé court (libellé de gauche), une valeur
 * mise en avant (texte de droite), et une note d'explication optionnelle.
 * Ce triplet correspond 1:1 à une ligne du panneau de conditions public.
 */
export interface RentalCondition {
  /** Intitulé court, p. ex. « Âge minimum », « Permis ». */
  label: string;
  /** Valeur mise en avant, p. ex. « 21 ans », « Depuis 2 ans », « Obligatoire ». */
  value: string;
  /** Note d'explication facultative affichée sous l'intitulé. */
  hint?: string;
}

export const MAX_RENTAL_CONDITIONS = 12;
export const RENTAL_CONDITION_LABEL_MAX = 40;
export const RENTAL_CONDITION_VALUE_MAX = 60;
export const RENTAL_CONDITION_HINT_MAX = 200;

/**
 * Conditions de base proposées en un clic dans l'éditeur. Elles reprennent les
 * exigences usuelles d'une agence ; l'admin part de là puis ajuste librement la
 * valeur et la note pour chaque véhicule.
 */
export const RENTAL_CONDITION_PRESETS: readonly RentalCondition[] = [
  {
    label: "Âge minimum",
    value: "21 ans",
    hint: "Âge requis du conducteur principal.",
  },
  {
    label: "Permis de conduire",
    value: "Depuis 2 ans",
    hint: "Permis en cours de validité, catégorie B.",
  },
  {
    label: "Pièce d'identité",
    value: "Obligatoire",
    hint: "Carte d'identité ou passeport en cours de validité.",
  },
  {
    label: "Justificatif de domicile",
    value: "De moins de 3 mois",
    hint: "Facture d'énergie, téléphone ou avis d'imposition récent.",
  },
  {
    label: "Carte bancaire",
    value: "Au nom du conducteur",
    hint: "Pour l'empreinte de caution à la remise des clés.",
  },
  {
    label: "Conducteur additionnel",
    value: "Sur demande",
    hint: "À déclarer et présenter avant le départ.",
  },
] as const;

/** Tronque proprement une chaîne après normalisation des espaces. */
function clip(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return raw.replace(/\s+/g, " ").trim().slice(0, max);
}

/**
 * Normalise une valeur `Car.rentalConditions` (Json libre, venu de la DB ou
 * d'un formulaire) en une liste de conditions valides, dans l'ordre fourni.
 * Tolérant : ignore les entrées sans intitulé ou sans valeur, tronque les
 * champs trop longs, plafonne le nombre d'entrées. Ne lève jamais — sûr à
 * appeler avec n'importe quelle entrée non fiable.
 */
export function parseRentalConditions(raw: unknown): RentalCondition[] {
  if (!Array.isArray(raw)) return [];

  const conditions: RentalCondition[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const obj = entry as Record<string, unknown>;
    const label = clip(obj.label, RENTAL_CONDITION_LABEL_MAX);
    const value = clip(obj.value, RENTAL_CONDITION_VALUE_MAX);
    if (!label || !value) continue;
    const hint = clip(obj.hint, RENTAL_CONDITION_HINT_MAX);
    conditions.push(hint ? { label, value, hint } : { label, value });
    if (conditions.length >= MAX_RENTAL_CONDITIONS) break;
  }
  return conditions;
}
