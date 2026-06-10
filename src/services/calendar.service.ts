import { prisma } from "@/lib/prisma";
import {
  BookingSource,
  BookingStatus,
  CarStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

/**
 * Données du planning de flotte (vue calendrier admin).
 *
 * Tout est aplati en types sérialisables (Decimal → number, les Date restent
 * des Date, sérialisées proprement par Next à la frontière RSC → client) afin
 * de pouvoir passer directement le résultat à un composant client.
 */

// Statuts affichés sur le planning. CANCELLED / DECLINED sont masqués : ils ne
// bloquent rien et pollueraient la lecture des disponibilités.
const VISIBLE_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING_REVIEW,
  BookingStatus.CONFIRMED,
  BookingStatus.IN_PROGRESS,
  BookingStatus.COMPLETED,
];

export interface ScheduleBooking {
  kind: "booking";
  id: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  status: BookingStatus;
  source: BookingSource;
  totalPrice: number;
  paymentStatus: PaymentStatus;
  amountPaid: number;
  paymentMethod: PaymentMethod | null;
  paymentNote: string | null;
  internalNote: string | null;
  customerMessage: string | null;
  declineReason: string | null;
  createdAt: Date;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
}

export interface ScheduleBlock {
  kind: "block";
  id: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
}

export type ScheduleSegment = ScheduleBooking | ScheduleBlock;

export interface ScheduleCar {
  id: string;
  brand: string;
  model: string;
  mainImage: string;
  status: CarStatus;
  segments: ScheduleSegment[];
}

export interface FleetSchedule {
  cars: ScheduleCar[];
  /** Compteurs sur la fenêtre, pour l'en-tête de page. */
  counts: {
    confirmed: number;
    pending: number;
    blocked: number;
  };
}

/**
 * Construit le planning de la flotte sur la fenêtre [from, to[.
 *
 * Un segment chevauche la fenêtre dès lors que `start < to` ET `end > from`
 * (intervalles demi-ouverts, cohérent avec la logique de réservation).
 */
export async function getFleetSchedule({
  from,
  to,
}: {
  from: Date;
  to: Date;
}): Promise<FleetSchedule> {
  const overlap = { startDate: { lt: to }, endDate: { gt: from } };

  const [cars, bookings, blocks] = await Promise.all([
    prisma.car.findMany({
      select: { id: true, brand: true, model: true, mainImage: true, status: true },
      orderBy: [{ displayOrder: "asc" }, { brand: "asc" }, { model: "asc" }],
    }),
    prisma.booking.findMany({
      where: { status: { in: VISIBLE_STATUSES }, ...overlap },
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.blockedDate.findMany({
      where: { ...overlap },
      orderBy: { startDate: "asc" },
    }),
  ]);

  const segmentsByCar = new Map<string, ScheduleSegment[]>();
  for (const car of cars) segmentsByCar.set(car.id, []);

  let confirmed = 0;
  let pending = 0;

  for (const b of bookings) {
    const bucket = segmentsByCar.get(b.carId);
    if (!bucket) continue; // véhicule supprimé entre-temps — ignoré
    if (b.status === BookingStatus.PENDING_REVIEW) pending += 1;
    else confirmed += 1;
    bucket.push({
      kind: "booking",
      id: b.id,
      carId: b.carId,
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status,
      source: b.source,
      totalPrice: Number(b.totalPrice),
      paymentStatus: b.paymentStatus,
      amountPaid: Number(b.amountPaid),
      paymentMethod: b.paymentMethod,
      paymentNote: b.paymentNote,
      internalNote: b.internalNote,
      customerMessage: b.customerMessage,
      declineReason: b.declineReason,
      createdAt: b.createdAt,
      customerName: b.user.name,
      customerEmail: b.user.email,
      customerPhone: b.user.phone,
    });
  }

  for (const blk of blocks) {
    const bucket = segmentsByCar.get(blk.carId);
    if (!bucket) continue;
    bucket.push({
      kind: "block",
      id: blk.id,
      carId: blk.carId,
      startDate: blk.startDate,
      endDate: blk.endDate,
      reason: blk.reason,
    });
  }

  const scheduleCars: ScheduleCar[] = cars.map((car) => ({
    ...car,
    segments: segmentsByCar.get(car.id) ?? [],
  }));

  return {
    cars: scheduleCars,
    counts: { confirmed, pending, blocked: blocks.length },
  };
}
