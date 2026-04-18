import { Car } from "@prisma/client";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  getISODay,
  isFriday,
  isMonday,
  startOfDay,
} from "date-fns";

export interface NormalizedBookingDates {
  startDate: Date;
  endDate: Date;
}

export function normalizeBookingDates(
  startDateInput: string | Date,
  endDateInput: string | Date,
): NormalizedBookingDates {
  const startDate = startOfDay(new Date(startDateInput));
  const endDate = startOfDay(new Date(endDateInput));

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
    isFriday(startDate) &&
    isMonday(endDate) &&
    car.weekendPackagePrice
  ) {
    return Number(Number(car.weekendPackagePrice).toFixed(2));
  }

  return Number((rentalDays * Number(car.pricePerDay)).toFixed(2));
}

export interface BookingPriceBreakdown {
  totalPrice: number;
  depositDueNow: number;
  remainingBalance: number;
}

export function validateBusinessBookingRules(startDate: Date, endDate: Date, now = new Date()): void {
  const today = startOfDay(now);
  const rentalDays = calculateRentalDays(startDate, endDate);
  const maxRentalDay = addMonths(today, 2);
  const lastChargedDay = addDays(endDate, -1);

  if (lastChargedDay > maxRentalDay) {
    throw new Error("Le calendrier est ouvert jusqu'a 2 mois maximum.");
  }

  if (rentalDays === 1) {
    const startDay = getISODay(startDate);
    const minOneDayStart = addDays(today, 7);
    const maxOneDayStart = addDays(today, 14);

    if (startDay < 1 || startDay > 4) {
      throw new Error("Les reservations 1 jour sont possibles uniquement du lundi au jeudi.");
    }

    if (startDate < minOneDayStart || startDate > maxOneDayStart) {
      throw new Error(
        "Une reservation d'une journee est possible seulement entre 1 et 2 semaines avant la date choisie.",
      );
    }

    return;
  }

  const days = eachDayOfInterval({ start: startDate, end: lastChargedDay });
  const hasWeekendDay = days.some((day) => getISODay(day) >= 5);

  if (hasWeekendDay) {
    const isFullWeekendOnly = isFriday(startDate) && isMonday(endDate) && rentalDays === 3;
    if (!isFullWeekendOnly) {
      throw new Error(
        "Toute reservation incluant vendredi, samedi ou dimanche doit etre faite du vendredi au lundi.",
      );
    }
  }
}

export function getBookingPriceBreakdown(totalPrice: number): BookingPriceBreakdown {
  const depositDueNow = Number((totalPrice * 0.4).toFixed(2));
  const remainingBalance = Number((totalPrice - depositDueNow).toFixed(2));
  return {
    totalPrice: Number(totalPrice.toFixed(2)),
    depositDueNow,
    remainingBalance,
  };
}

export function rangesOverlap(
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): boolean {
  return firstStart < secondEnd && firstEnd > secondStart;
}
