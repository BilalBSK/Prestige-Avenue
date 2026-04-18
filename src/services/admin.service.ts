import { prisma } from "@/lib/prisma";
import { getStripeServerClient } from "@/lib/stripe";
import { BookingStatus, PaymentStatus, Prisma } from "@prisma/client";
import { startOfMonth } from "date-fns";

export async function getAdminDashboardMetrics() {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [bookingsThisMonth, revenueAgg, upcomingBookings, availableCars, confirmedBookings] =
    await Promise.all([
      prisma.booking.count({
        where: { createdAt: { gte: monthStart } },
      }),
      prisma.booking.aggregate({
        _sum: { depositDueNow: true },
        where: {
          createdAt: { gte: monthStart },
          paymentStatus: PaymentStatus.PAID,
        },
      }),
      prisma.booking.count({
        where: {
          status: BookingStatus.CONFIRMED,
          startDate: { gte: now },
        },
      }),
      prisma.car.count({
        where: { status: "AVAILABLE" },
      }),
      prisma.booking.count({
        where: {
          status: BookingStatus.CONFIRMED,
        },
      }),
    ]);

  const occupationRate =
    availableCars + confirmedBookings === 0
      ? 0
      : Number(((confirmedBookings / (availableCars + confirmedBookings)) * 100).toFixed(2));

  return {
    bookingsThisMonth,
    monthlyRevenue: revenueAgg._sum.depositDueNow ?? new Prisma.Decimal(0),
    upcomingBookings,
    occupationRate,
  };
}

export async function refundBooking(bookingId: string) {
  const stripe = getStripeServerClient();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new Error("Reservation introuvable.");
  }

  if (!booking.stripeSessionId) {
    throw new Error("Aucune session Stripe associee.");
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(booking.stripeSessionId, {
    expand: ["payment_intent"],
  });

  if (!checkoutSession.payment_intent || typeof checkoutSession.payment_intent === "string") {
    throw new Error("Payment intent introuvable.");
  }

  await stripe.refunds.create({
    payment_intent: checkoutSession.payment_intent.id,
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: PaymentStatus.REFUNDED,
      status: BookingStatus.CANCELLED,
    },
  });
}
