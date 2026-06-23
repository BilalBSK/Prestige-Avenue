import { Car } from "@prisma/client";
import { addDays, addMonths, eachDayOfInterval } from "date-fns";
import { getCalendarDayOfWeekISO, parseCalendarDate } from "./calendar-date";

export interface NormalizedBookingDates {
  startDate: Date;
  endDate: Date;
}

export function normalizeBookingDates(
  startDateInput: string | Date,
  endDateInput: string | Date,
): NormalizedBookingDates {
  const startDate = parseCalendarDate(startDateInput);
  const endDate = parseCalendarDate(endDateInput);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new Error("Invalid booking dates.");
  }

  if (endDate <= startDate) {
    throw new Error("End date must be after start date.");
  }

  return { startDate, endDate };
}

export function calculateRentalDays(startDate: Date, endDate: Date): number {
  const days = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (days < 1) {
    throw new Error("Minimum booking duration is 1 day.");
  }

  return days;
}

/**
 * Motif de week-end d'un intervalle [start, end[ (les bornes sont des jours
 * calendaires ; `end` est le jour de restitution, non facturé).
 *
 *  - "48h" : vendredi → dimanche  OU  samedi → lundi   (2 jours facturés)
 *  - "72h" : vendredi → lundi                          (3 jours facturés)
 *  - null  : aucun motif de week-end reconnu
 *
 * Source unique de vérité, partagée par la validation et la tarification.
 */
export type WeekendPattern = "48h" | "72h";

export function classifyWeekendPattern(
  startDate: Date,
  endDate: Date,
): WeekendPattern | null {
  const rentalDays = calculateRentalDays(startDate, endDate);
  const startDow = getCalendarDayOfWeekISO(startDate);
  const endDow = getCalendarDayOfWeekISO(endDate);

  // 72h — vendredi → lundi
  if (rentalDays === 3 && startDow === 5 && endDow === 1) return "72h";

  // 48h — vendredi → dimanche, ou samedi → lundi
  // (dimanche = 7 en ISO 8601, cf. getCalendarDayOfWeekISO)
  if (rentalDays === 2 && ((startDow === 5 && endDow === 7) || (startDow === 6 && endDow === 1))) {
    return "48h";
  }

  return null;
}

export function calculateTotalPrice(
  car: Pick<
    Car,
    "pricePerDay" | "weekendPackagePrice48h" | "weekendPackagePrice72h"
  >,
  startDate: Date,
  endDate: Date,
): number {
  const rentalDays = calculateRentalDays(startDate, endDate);
  const pattern = classifyWeekendPattern(startDate, endDate);

  // Forfait week-end si la voiture en propose un pour ce motif ; sinon, au jour.
  if (pattern === "72h" && car.weekendPackagePrice72h) {
    return Number(car.weekendPackagePrice72h);
  }
  if (pattern === "48h" && car.weekendPackagePrice48h) {
    return Number(car.weekendPackagePrice48h);
  }

  return Number((rentalDays * Number(car.pricePerDay)).toFixed(2));
}

export function validateBusinessBookingRules(startDate: Date, endDate: Date, now = new Date()): void {
  const today = parseCalendarDate(now);
  const rentalDays = calculateRentalDays(startDate, endDate);
  const maxRentalDay = addMonths(today, 2);
  const lastChargedDay = addDays(endDate, -1);

  if (lastChargedDay > maxRentalDay) {
    throw new Error("Le calendrier est ouvert jusqu'à 2 mois maximum.");
  }

  if (rentalDays === 1) {
    const startDay = getCalendarDayOfWeekISO(startDate);
    const minOneDayStart = addDays(today, 7);
    const maxOneDayStart = addDays(today, 14);

    if (startDay < 1 || startDay > 4) {
      throw new Error("Les réservations 1 jour sont possibles uniquement du lundi au jeudi.");
    }

    if (startDate < minOneDayStart || startDate > maxOneDayStart) {
      throw new Error(
        "Une réservation d'une journée est possible seulement entre 1 et 2 semaines avant la date choisie.",
      );
    }

    return;
  }

  const days = eachDayOfInterval({ start: startDate, end: lastChargedDay });
  const hasWeekendDay = days.some((day) => getCalendarDayOfWeekISO(day) >= 5);

  if (hasWeekendDay && classifyWeekendPattern(startDate, endDate) === null) {
    throw new Error(
      "Toute réservation incluant le week-end doit être du vendredi au dimanche, du samedi au lundi, ou du vendredi au lundi.",
    );
  }
}

export function rangesOverlap(
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean {
  return firstStart < secondEnd && firstEnd > secondStart;
}
