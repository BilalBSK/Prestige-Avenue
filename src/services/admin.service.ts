import { prisma } from "@/lib/prisma";
import { BookingStatus, Prisma } from "@prisma/client";
import { startOfMonth } from "date-fns";

export async function getAdminDashboardMetrics() {
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [bookingsThisMonth, monthlyRevenueAgg, upcomingBookings, availableCars, activeBookings, pendingReview] =
    await Promise.all([
      prisma.booking.count({
        where: { createdAt: { gte: monthStart } },
      }),
      prisma.booking.aggregate({
        _sum: { totalPrice: true },
        where: {
          createdAt: { gte: monthStart },
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED] },
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
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] },
        },
      }),
      prisma.booking.count({
        where: { status: BookingStatus.PENDING_REVIEW },
      }),
    ]);

  const occupationRate =
    availableCars + activeBookings === 0
      ? 0
      : Number(((activeBookings / (availableCars + activeBookings)) * 100).toFixed(2));

  return {
    bookingsThisMonth,
    monthlyRevenue: monthlyRevenueAgg._sum.totalPrice ?? new Prisma.Decimal(0),
    upcomingBookings,
    occupationRate,
    pendingReview,
  };
}
