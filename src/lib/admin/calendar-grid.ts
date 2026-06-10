/**
 * Helpers purs pour le planning de flotte (vue calendrier admin).
 *
 * Les dates de réservation sont stockées en minuit UTC (cf. parseCalendarDate).
 * Après sérialisation RSC → client, ce sont des Date au même instant UTC. Tout
 * le calcul de colonnes se fait donc en UTC pour éviter qu'un décalage de fuseau
 * ne fasse glisser une réservation d'un jour.
 */

const MS_PER_DAY = 86_400_000;

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
// Lundi-first weekday initials.
const WEEKDAY_FR = ["L", "M", "M", "J", "V", "S", "D"];

/** Minuit UTC d'une date (ramène n'importe quel instant au jour calendaire). */
export function utcMidnight(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Construit la fenêtre [from, to[ d'un mois donné (YYYY-MM, défaut: mois courant). */
export function monthWindow(monthParam: string | undefined, today: Date): { from: Date; to: Date } {
  const base = utcMidnight(today);
  let year = base.getUTCFullYear();
  let month = base.getUTCMonth();

  const match = /^(\d{4})-(\d{2})$/.exec(monthParam ?? "");
  if (match) {
    const parsedYear = Number(match[1]);
    const parsedMonth = Number(match[2]) - 1; // 0–11
    // On n'accepte que des valeurs valides ; un mois hors plage (ex. 2026-13)
    // ou une année absurde retombe sur le mois courant plutôt que de « rouler »
    // silencieusement sur une autre année.
    if (parsedMonth >= 0 && parsedMonth <= 11 && parsedYear >= 2000 && parsedYear <= 2100) {
      year = parsedYear;
      month = parsedMonth;
    }
  }

  const from = new Date(Date.UTC(year, month, 1));
  const to = new Date(Date.UTC(year, month + 1, 1));
  return { from, to };
}

export interface GridDay {
  date: Date;
  /** Quantième du mois (1–31). */
  dayOfMonth: number;
  /** Initiale du jour (L M M J V S D). */
  weekdayInitial: string;
  isWeekend: boolean;
}

/** Liste des jours de la fenêtre [from, to[, en UTC. */
export function buildDays(from: Date, to: Date): GridDay[] {
  const days: GridDay[] = [];
  for (let t = from.getTime(); t < to.getTime(); t += MS_PER_DAY) {
    const date = new Date(t);
    // 0 = dimanche … 6 = samedi → index lundi-first.
    const mondayIdx = (date.getUTCDay() + 6) % 7;
    days.push({
      date,
      dayOfMonth: date.getUTCDate(),
      weekdayInitial: WEEKDAY_FR[mondayIdx],
      isWeekend: mondayIdx >= 5,
    });
  }
  return days;
}

/** Différence en jours calendaires (UTC) : floor((a - b) / jour). */
export function dayDiff(a: Date, b: Date): number {
  return Math.floor((utcMidnight(a).getTime() - utcMidnight(b).getTime()) / MS_PER_DAY);
}

export interface SegmentPlacement<T> {
  segment: T;
  /** Colonne de départ (incluse), bornée à la fenêtre. */
  startIndex: number;
  /** Colonne de fin (exclue), bornée à la fenêtre. */
  endIndex: number;
  /** La barre déborde avant la fenêtre (bord gauche aplati). */
  clippedStart: boolean;
  /** La barre déborde après la fenêtre (bord droit aplati). */
  clippedEnd: boolean;
  /** Voie d'empilement (0 = première), pour les chevauchements. */
  lane: number;
}

/**
 * Place des segments [start, end[ sur la grille [from, to[ et les empile en
 * voies : deux segments qui se chevauchent ne partagent jamais une voie, de
 * sorte qu'un conflit (demande en attente vs réservation confirmée) reste
 * visible. Renvoie aussi le nombre total de voies utilisées.
 */
export function placeSegments<T extends { startDate: Date; endDate: Date }>(
  segments: T[],
  from: Date,
  to: Date,
  totalDays: number,
): { placements: SegmentPlacement<T>[]; laneCount: number } {
  // Tri par début réel pour un empilement déterministe et compact.
  const sorted = [...segments].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime(),
  );

  // Fin (exclue) de la dernière barre posée sur chaque voie, en index colonne.
  const laneEnds: number[] = [];
  const placements: SegmentPlacement<T>[] = [];

  for (const segment of sorted) {
    const rawStart = dayDiff(segment.startDate, from);
    const rawEnd = dayDiff(segment.endDate, from); // exclue
    const startIndex = Math.max(0, rawStart);
    const endIndex = Math.min(totalDays, rawEnd);
    if (endIndex <= startIndex) continue; // hors fenêtre après bornage

    // Première voie libre (le segment commence après la fin de la dernière barre).
    let lane = laneEnds.findIndex((end) => end <= startIndex);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(endIndex);
    } else {
      laneEnds[lane] = endIndex;
    }

    placements.push({
      segment,
      startIndex,
      endIndex,
      clippedStart: rawStart < 0,
      clippedEnd: rawEnd > totalDays,
      lane,
    });
  }

  return { placements, laneCount: Math.max(1, laneEnds.length) };
}

/** Libellé « Mois AAAA » de la fenêtre. */
export function monthLabel(from: Date): string {
  return `${MONTHS_FR[from.getUTCMonth()]} ${from.getUTCFullYear()}`;
}

/** Param YYYY-MM décalé de `delta` mois. */
export function shiftMonthParam(from: Date, delta: number): string {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
