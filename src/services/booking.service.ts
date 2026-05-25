import {
  calculateTotalPrice,
  normalizeBookingDates,
  validateBusinessBookingRules,
} from "@/lib/booking";
import { prisma } from "@/lib/prisma";
import { BookingStatus, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

interface AvailabilityInput {
  carId: string;
  startDate: string | Date;
  endDate: string | Date;
}

interface CreateBookingRequestInput extends AvailabilityInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customerMessage?: string;
  submissionToken: string;
}

const BLOCKING_STATUSES: BookingStatus[] = [
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
];

export async function checkAvailability(input: AvailabilityInput) {
  const { startDate, endDate } = normalizeBookingDates(input.startDate, input.endDate);
  try {
    validateBusinessBookingRules(startDate, endDate);
  } catch (error) {
    return {
      isAvailable: false,
      reason:
        error instanceof Error
          ? error.message
          : "La période ne respecte pas les règles de réservation.",
    };
  }

  const car = await prisma.car.findUnique({
    where: { id: input.carId },
    select: { id: true, status: true },
  });

  if (!car) {
    return { isAvailable: false, reason: "Véhicule introuvable." };
  }

  if (car.status !== "AVAILABLE") {
    return { isAvailable: false, reason: "Véhicule indisponible." };
  }

  const [existingBookings, blockedDates] = await Promise.all([
    prisma.booking.count({
      where: {
        carId: input.carId,
        status: { in: BLOCKING_STATUSES },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    }),
    prisma.blockedDate.count({
      where: {
        carId: input.carId,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    }),
  ]);

  if (existingBookings > 0 || blockedDates > 0) {
    return {
      isAvailable: false,
      reason: "Période déjà réservée ou bloquée.",
    };
  }

  return { isAvailable: true };
}

export async function createBookingRequest(input: CreateBookingRequestInput) {
  const { startDate, endDate } = normalizeBookingDates(input.startDate, input.endDate);
  validateBusinessBookingRules(startDate, endDate);
  const normalizedEmail = input.email.trim().toLowerCase();
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.replace(/\s+/g, " ").trim();
  const sanitizedPhone = input.phone.trim();
  const sanitizedMessage = input.customerMessage?.trim().slice(0, 500) || null;

  return prisma.$transaction(async (tx) => {
    const existingSubmission = await tx.booking.findUnique({
      where: { submissionToken: input.submissionToken },
      select: { id: true },
    });

    if (existingSubmission) {
      return { bookingId: existingSubmission.id };
    }

    const existingUser = await tx.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, phone: true, role: true },
    });

    let bookingUserId: string;

    if (existingUser) {
      bookingUserId = existingUser.id;
      if (
        existingUser.role === "USER" &&
        (existingUser.name !== fullName || (sanitizedPhone && existingUser.phone !== sanitizedPhone))
      ) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name: fullName,
            ...(sanitizedPhone ? { phone: sanitizedPhone } : {}),
          },
        });
      }
    } else {
      const generatedPassword = await bcrypt.hash(randomUUID(), 10);
      const createdUser = await tx.user.create({
        data: {
          name: fullName,
          email: normalizedEmail,
          phone: sanitizedPhone || null,
          password: generatedPassword,
        },
        select: { id: true },
      });
      bookingUserId = createdUser.id;
    }

    const car = await tx.car.findUnique({
      where: { id: input.carId },
      select: {
        id: true,
        brand: true,
        model: true,
        status: true,
        pricePerDay: true,
        weekendPackagePrice: true,
      },
    });

    if (!car) {
      throw new Error("Véhicule introuvable.");
    }

    if (car.status !== "AVAILABLE") {
      throw new Error("Véhicule indisponible.");
    }

    const [bookingOverlap, blockedOverlap] = await Promise.all([
      tx.booking.count({
        where: {
          carId: input.carId,
          status: { in: BLOCKING_STATUSES },
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      }),
      tx.blockedDate.count({
        where: {
          carId: input.carId,
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      }),
    ]);

    if (bookingOverlap > 0 || blockedOverlap > 0) {
      throw new Error("Période indisponible.");
    }

    const totalPriceNumber = calculateTotalPrice(car, startDate, endDate);
    const totalPrice = new Prisma.Decimal(totalPriceNumber);

    const booking = await tx.booking.create({
      data: {
        userId: bookingUserId,
        carId: input.carId,
        startDate,
        endDate,
        totalPrice,
        status: BookingStatus.PENDING_REVIEW,
        customerMessage: sanitizedMessage,
        submissionToken: input.submissionToken,
      },
    });

    return { bookingId: booking.id };
  });
}

export async function getBookingById(bookingId: string) {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      car: {
        select: {
          brand: true,
          model: true,
          mainImage: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
}

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING_REVIEW: [BookingStatus.CONFIRMED, BookingStatus.DECLINED],
  CONFIRMED: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  IN_PROGRESS: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
  DECLINED: [],
};

export async function transitionBooking(
  bookingId: string,
  nextStatus: BookingStatus,
  declineReason?: string,
) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, status: true },
    });

    if (!booking) {
      throw new Error("Réservation introuvable.");
    }

    const allowed = ALLOWED_TRANSITIONS[booking.status];
    if (!allowed.includes(nextStatus)) {
      throw new Error(
        `Transition impossible: ${booking.status} → ${nextStatus}.`,
      );
    }

    if (nextStatus === BookingStatus.DECLINED && !declineReason?.trim()) {
      throw new Error("Un motif de refus est requis.");
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: nextStatus,
        ...(nextStatus === BookingStatus.DECLINED
          ? { declineReason: declineReason?.trim().slice(0, 500) ?? null }
          : {}),
      },
    });

    return updated;
  });
}
