import {
  calculateTotalPrice,
  getBookingPriceBreakdown,
  normalizeBookingDates,
  validateBusinessBookingRules,
} from "@/lib/booking";
import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/stripe";
import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

interface AvailabilityInput {
  carId: string;
  startDate: string | Date;
  endDate: string | Date;
}

interface CreateCheckoutInput extends AvailabilityInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  submissionToken: string;
  successUrl: string;
  cancelUrl: string;
}

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
          : "La periode ne respecte pas les regles de reservation.",
    };
  }

  const car = await prisma.car.findUnique({
    where: { id: input.carId },
    select: { id: true, status: true },
  });

  if (!car) {
    return { isAvailable: false, reason: "Vehicule introuvable." };
  }

  if (car.status !== "AVAILABLE") {
    return { isAvailable: false, reason: "Vehicule indisponible." };
  }

  const [existingBookings, blockedDates] = await Promise.all([
    prisma.booking.count({
      where: {
        carId: input.carId,
        status: "CONFIRMED",
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
      reason: "Periode deja reservee ou bloquee.",
    };
  }

  return { isAvailable: true };
}

export async function createCheckoutSessionForBooking(input: CreateCheckoutInput) {
  const stripe = getStripeServerClient();
  const { startDate, endDate } = normalizeBookingDates(input.startDate, input.endDate);
  validateBusinessBookingRules(startDate, endDate);
  const normalizedEmail = input.email.trim().toLowerCase();
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.replace(/\s+/g, " ").trim();
  const sanitizedPhone = input.phone.trim();

  return prisma.$transaction(async (tx) => {
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
        depositAmount: true,
      },
    });

    if (!car) {
      throw new Error("Vehicule introuvable.");
    }

    if (car.status !== "AVAILABLE") {
      throw new Error("Vehicule indisponible.");
    }

    const [bookingOverlap, blockedOverlap] = await Promise.all([
      tx.booking.count({
        where: {
          carId: input.carId,
          status: BookingStatus.CONFIRMED,
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
      throw new Error("Periode indisponible.");
    }

    const existingSubmission = await tx.booking.findUnique({
      where: { submissionToken: input.submissionToken },
      select: { id: true, stripeSessionId: true },
    });

    if (existingSubmission?.stripeSessionId) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        existingSubmission.stripeSessionId,
      );
      if (existingSession.url) {
        return { checkoutUrl: existingSession.url, bookingId: existingSubmission.id };
      }
    }

    const totalPriceNumber = calculateTotalPrice(car, startDate, endDate);
    const priceBreakdown = getBookingPriceBreakdown(totalPriceNumber);
    const totalPrice = new Prisma.Decimal(priceBreakdown.totalPrice);
    const depositDueNow = new Prisma.Decimal(priceBreakdown.depositDueNow);
    const remainingBalance = new Prisma.Decimal(priceBreakdown.remainingBalance);
    const unitAmount = Math.round(priceBreakdown.depositDueNow * 100);

    const booking = await tx.booking.create({
      data: {
        userId: bookingUserId,
        carId: input.carId,
        startDate,
        endDate,
        totalPrice,
        depositDueNow,
        remainingBalance,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
        submissionToken: input.submissionToken,
      },
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        bookingId: booking.id,
        customerEmail: normalizedEmail,
        customerName: fullName,
      },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: unitAmount,
            product_data: {
              name: `${car.brand} ${car.model}`,
              description: `Acompte 40% pour la location du ${startDate.toISOString().slice(0, 10)} au ${endDate.toISOString().slice(0, 10)}`,
            },
          },
        },
      ],
    });

    await tx.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: session.id },
    });

    if (!session.url) {
      throw new Error("Stripe checkout URL missing.");
    }

    return { checkoutUrl: session.url, bookingId: booking.id };
  });
}
