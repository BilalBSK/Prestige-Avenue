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

export function calculateTotalPrice(
  car: Pick<Car, "pricePerDay" | "weekendPackagePrice">,
  startDate: Date,
  endDate: Date,
): number {
  const rentalDays = calculateRentalDays(startDate, endDate);

  if (
    rentalDays === 3 &&
    getCalendarDayOfWeekISO(startDate) === 5 &&
    getCalendarDayOfWeekISO(endDate) === 1 &&
    car.weekendPackagePrice
  ) {
    return Number(car.weekendPackagePrice);
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

  if (hasWeekendDay) {
    const isFullWeekendOnly =
      rentalDays === 3 &&
      getCalendarDayOfWeekISO(startDate) === 5 &&
      getCalendarDayOfWeekISO(endDate) === 1;
    if (!isFullWeekendOnly) {
      throw new Error(
        "Toute réservation incluant vendredi, samedi ou dimanche doit être faite du vendredi au lundi.",
      );
    }
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
