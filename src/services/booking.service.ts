import {
  calculateTotalPrice,
  normalizeBookingDates,
  validateBusinessBookingRules,
} from "@/lib/booking";
import { formatCalendarDate } from "@/lib/calendar-date";
import { prisma } from "@/lib/prisma";
import {
  notifyBookingConfirmed,
  notifyBookingDeclined,
  notifyNewBookingRequest,
} from "@/services/notification.service";
import {
  BookingSource,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  Role,
} from "@prisma/client";
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

/**
 * Vérifie, dans une transaction, qu'aucune réservation bloquante (CONFIRMED /
 * IN_PROGRESS) ni période d'indisponibilité ne chevauche [startDate, endDate[
 * pour ce véhicule. `excludeBookingId` permet d'ignorer la réservation en cours
 * d'édition. Lève une erreur « indisponible » en cas de conflit.
 */
async function assertNoOverlap(
  tx: Prisma.TransactionClient,
  carId: string,
  startDate: Date,
  endDate: Date,
  excludeBookingId?: string,
): Promise<void> {
  const [bookingOverlap, blockedOverlap] = await Promise.all([
    tx.booking.count({
      where: {
        carId,
        status: { in: BLOCKING_STATUSES },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      },
    }),
    tx.blockedDate.count({
      where: {
        carId,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    }),
  ]);

  if (bookingOverlap > 0 || blockedOverlap > 0) {
    throw new Error("Période indisponible : elle chevauche une réservation confirmée ou une indisponibilité.");
  }
}

/**
 * Déduit un règlement cohérent à partir d'un montant encaissé et du total.
 * Garantit l'invariant amountPaid ∈ [0, total] et un statut aligné, quelles que
 * soient les valeurs reçues du client. Si `status` est forcé (PAID/UNPAID),
 * le montant est ajusté en conséquence.
 */
function normalizePayment(
  total: number,
  amountPaidInput: number,
  statusInput?: PaymentStatus,
): { paymentStatus: PaymentStatus; amountPaid: number } {
  const totalRounded = Math.max(0, Number(total.toFixed(2)));

  if (statusInput === PaymentStatus.PAID) {
    return { paymentStatus: PaymentStatus.PAID, amountPaid: totalRounded };
  }
  if (statusInput === PaymentStatus.UNPAID) {
    return { paymentStatus: PaymentStatus.UNPAID, amountPaid: 0 };
  }

  const clamped = Math.min(Math.max(0, Number(amountPaidInput.toFixed(2))), totalRounded);
  if (clamped <= 0) return { paymentStatus: PaymentStatus.UNPAID, amountPaid: 0 };
  if (clamped >= totalRounded) return { paymentStatus: PaymentStatus.PAID, amountPaid: totalRounded };
  return { paymentStatus: PaymentStatus.PARTIAL, amountPaid: clamped };
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

export interface UnavailableRange {
  /** Premier jour occupé, inclus — `YYYY-MM-DD`. */
  start: string;
  /** Jour de restitution, exclu — `YYYY-MM-DD`. Reste sélectionnable comme arrivée. */
  end: string;
}

/**
 * Périodes pendant lesquelles ce véhicule ne peut PAS être réservé sur la fenêtre
 * `[from, to[` : réservations bloquantes (CONFIRMED / IN_PROGRESS) et
 * indisponibilités saisies par l'agence (BlockedDate). Les demandes PENDING_REVIEW
 * ne bloquent pas (cf. BLOCKING_STATUSES) — l'agence arbitre manuellement.
 *
 * Les segments sont renvoyés fusionnés (intervalles disjoints, triés) au format
 * `YYYY-MM-DD`, bornes demi-ouvertes cohérentes avec toute la logique d'overlap du
 * projet. Sert à griser le calendrier public ; ce n'est PAS un contrôle d'accès —
 * la transaction `assertNoOverlap` reste le garde-fou autoritatif à la soumission.
 */
export async function getUnavailableRanges(
  carId: string,
  from: Date,
  to: Date,
): Promise<UnavailableRange[]> {
  const overlap = { startDate: { lt: to }, endDate: { gt: from } };

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: { carId, status: { in: BLOCKING_STATUSES }, ...overlap },
      select: { startDate: true, endDate: true },
    }),
    prisma.blockedDate.findMany({
      where: { carId, ...overlap },
      select: { startDate: true, endDate: true },
    }),
  ]);

  // Bornage à la fenêtre puis tri par début, pour une fusion en une passe.
  const segments = [...bookings, ...blocks]
    .map((s) => ({
      start: s.startDate.getTime() < from.getTime() ? from : s.startDate,
      end: s.endDate.getTime() > to.getTime() ? to : s.endDate,
    }))
    .filter((s) => s.end.getTime() > s.start.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Coalescence des intervalles qui se chevauchent ou se touchent (end == start
  // suivant) → intervalles disjoints, payload minimal, calcul client trivial.
  const merged: { start: Date; end: Date }[] = [];
  for (const seg of segments) {
    const last = merged[merged.length - 1];
    if (last && seg.start.getTime() <= last.end.getTime()) {
      if (seg.end.getTime() > last.end.getTime()) last.end = seg.end;
    } else {
      merged.push({ start: seg.start, end: seg.end });
    }
  }

  return merged.map((s) => ({
    start: formatCalendarDate(s.start),
    end: formatCalendarDate(s.end),
  }));
}

export async function createBookingRequest(input: CreateBookingRequestInput) {
  const { startDate, endDate } = normalizeBookingDates(input.startDate, input.endDate);
  validateBusinessBookingRules(startDate, endDate);
  const normalizedEmail = input.email.trim().toLowerCase();
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.replace(/\s+/g, " ").trim();
  const sanitizedPhone = input.phone.trim();
  const sanitizedMessage = input.customerMessage?.trim().slice(0, 500) || null;

  const result = await prisma.$transaction(async (tx) => {
    const existingSubmission = await tx.booking.findUnique({
      where: { submissionToken: input.submissionToken },
      select: { id: true },
    });

    if (existingSubmission) {
      // Re-soumission idempotente : la demande existe déjà, on ne renotifie pas.
      return { bookingId: existingSubmission.id, isNew: false as const };
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
        weekendPackagePrice48h: true,
        weekendPackagePrice72h: true,
      },
    });

    if (!car) {
      throw new Error("Véhicule introuvable.");
    }

    if (car.status !== "AVAILABLE") {
      throw new Error("Véhicule indisponible.");
    }

    await assertNoOverlap(tx, input.carId, startDate, endDate);

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

    return {
      bookingId: booking.id,
      isNew: true as const,
      notification: {
        carBrand: car.brand,
        carModel: car.model,
        startDate,
        endDate,
        totalPrice: totalPriceNumber,
        customerName: fullName,
        customerEmail: normalizedEmail,
        customerPhone: sanitizedPhone || null,
        customerMessage: sanitizedMessage,
      },
    };
  });

  // Notification e-mail à l'agence, hors transaction et seulement pour une
  // nouvelle demande. `notifyNewBookingRequest` absorbe ses propres erreurs :
  // un e-mail en échec ne doit jamais faire échouer la réservation.
  if (result.isNew) {
    await notifyNewBookingRequest({
      bookingId: result.bookingId,
      ...result.notification,
    });
  }

  return { bookingId: result.bookingId };
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

export interface CreateManualBookingInput {
  carId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  startDate: string | Date;
  endDate: string | Date;
  /** Prix forcé par l'agence ; si absent, on calcule le tarif standard. */
  totalPrice?: number;
  /** Seuls CONFIRMED (bloque les dates) ou PENDING_REVIEW sont autorisés à la création. */
  initialStatus: Extract<BookingStatus, "CONFIRMED" | "PENDING_REVIEW">;
  source: Extract<BookingSource, "PHONE" | "IN_PERSON">;
  amountPaid?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  paymentNote?: string;
  internalNote?: string;
  /** Envoyer l'e-mail de confirmation au client (uniquement si CONFIRMED + e-mail présent). */
  sendConfirmationEmail?: boolean;
}

/**
 * Crée une réservation saisie manuellement par l'agence (téléphone / sur place).
 *
 * Override admin : les règles métier du site (week-ends imposés, délai 1–2
 * semaines, horizon 2 mois) NE s'appliquent PAS — l'agence est souveraine sur
 * les dates. En revanche, la protection anti-double-réservation reste TOUJOURS
 * active (chevauchement avec une résa bloquante ou une indisponibilité → refus),
 * dans la même transaction que le flux public.
 *
 * Le client est rapproché par e-mail (si fourni), sinon par téléphone, sinon créé.
 */
export async function createManualBooking(input: CreateManualBookingInput) {
  const { startDate, endDate } = normalizeBookingDates(input.startDate, input.endDate);

  const fullName = input.customerName.trim().replace(/\s+/g, " ");
  if (!fullName) {
    throw new Error("Le nom du client est requis.");
  }
  const normalizedEmail = input.customerEmail?.trim().toLowerCase() || null;
  const sanitizedPhone = input.customerPhone?.trim() || null;
  if (!normalizedEmail && !sanitizedPhone) {
    throw new Error("Renseignez au moins un e-mail ou un téléphone.");
  }
  const sanitizedInternalNote = input.internalNote?.trim().slice(0, 1000) || null;
  const sanitizedPaymentNote = input.paymentNote?.trim().slice(0, 500) || null;

  const result = await prisma.$transaction(async (tx) => {
    const car = await tx.car.findUnique({
      where: { id: input.carId },
      select: {
        id: true,
        brand: true,
        model: true,
        status: true,
        pricePerDay: true,
        weekendPackagePrice48h: true,
        weekendPackagePrice72h: true,
      },
    });

    if (!car) {
      throw new Error("Véhicule introuvable.");
    }

    // Une réservation CONFIRMED bloque les dates → on exige un véhicule actif.
    // Une PENDING_REVIEW ne bloque pas, on tolère donc un véhicule en maintenance
    // (override admin : utile pour pré-réserver un véhicule en sortie d'atelier).
    if (input.initialStatus === BookingStatus.CONFIRMED && car.status !== "AVAILABLE") {
      throw new Error("Véhicule indisponible : impossible de confirmer une réservation dessus.");
    }

    // Anti-double-réservation TOUJOURS active, comme le flux public : on n'inscrit
    // jamais (même en attente) une période déjà bloquée par une réservation
    // confirmée/en cours ou une indisponibilité.
    await assertNoOverlap(tx, input.carId, startDate, endDate);

    // Rapprochement du client : e-mail prioritaire, puis téléphone, puis création.
    let bookingUserId: string | null = null;

    if (normalizedEmail) {
      const byEmail = await tx.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true, name: true, phone: true, role: true },
      });
      if (byEmail) {
        bookingUserId = byEmail.id;
        if (
          byEmail.role === Role.USER &&
          (byEmail.name !== fullName || (sanitizedPhone && byEmail.phone !== sanitizedPhone))
        ) {
          await tx.user.update({
            where: { id: byEmail.id },
            data: { name: fullName, ...(sanitizedPhone ? { phone: sanitizedPhone } : {}) },
          });
        }
      }
    }

    if (!bookingUserId && sanitizedPhone) {
      // `phone` n'est pas unique : un même numéro peut désigner plusieurs comptes
      // (saisi par erreur, ligne partagée, numéro recyclé). On ne rapproche donc
      // QUE si le téléphone correspond à exactement un client ET que le nom
      // concorde — sinon on crée un nouveau client plutôt que de risquer
      // d'attacher la réservation au mauvais dossier. On ne renomme jamais un
      // client existant ; on complète seulement un e-mail manquant.
      const byPhone = await tx.user.findMany({
        where: { phone: sanitizedPhone, role: Role.USER },
        select: { id: true, name: true, email: true },
        take: 2,
      });
      const normalizedName = fullName.toLowerCase();
      const soleMatch =
        byPhone.length === 1 && byPhone[0].name.trim().toLowerCase() === normalizedName
          ? byPhone[0]
          : null;
      if (soleMatch) {
        bookingUserId = soleMatch.id;
        // Complète l'e-mail s'il manquait et qu'on en a un maintenant — sauf si
        // cet e-mail est déjà pris par un autre compte (contrainte @unique).
        if (normalizedEmail && !soleMatch.email) {
          const emailTaken = await tx.user.findUnique({
            where: { email: normalizedEmail },
            select: { id: true },
          });
          if (!emailTaken) {
            await tx.user.update({
              where: { id: soleMatch.id },
              data: { email: normalizedEmail },
            });
          }
        }
      }
    }

    if (!bookingUserId) {
      const generatedPassword = await bcrypt.hash(randomUUID(), 10);
      const createdUser = await tx.user.create({
        data: {
          name: fullName,
          email: normalizedEmail,
          phone: sanitizedPhone,
          password: generatedPassword,
        },
        select: { id: true },
      });
      bookingUserId = createdUser.id;
    }

    const computedPrice = calculateTotalPrice(car, startDate, endDate);
    const totalPriceNumber =
      input.totalPrice !== undefined && input.totalPrice >= 0
        ? Number(input.totalPrice.toFixed(2))
        : computedPrice;

    const payment = normalizePayment(
      totalPriceNumber,
      input.amountPaid ?? 0,
      input.paymentStatus,
    );

    const booking = await tx.booking.create({
      data: {
        userId: bookingUserId,
        carId: input.carId,
        startDate,
        endDate,
        totalPrice: new Prisma.Decimal(totalPriceNumber),
        status: input.initialStatus,
        source: input.source,
        paymentStatus: payment.paymentStatus,
        amountPaid: new Prisma.Decimal(payment.amountPaid),
        paymentMethod: input.paymentMethod ?? null,
        paymentNote: sanitizedPaymentNote,
        internalNote: sanitizedInternalNote,
        // Jeton d'idempotence pour rester cohérent avec le flux public.
        submissionToken: randomUUID(),
      },
    });

    return {
      bookingId: booking.id,
      status: booking.status,
      notify:
        input.sendConfirmationEmail &&
        input.initialStatus === BookingStatus.CONFIRMED &&
        normalizedEmail
          ? {
              carBrand: car.brand,
              carModel: car.model,
              startDate,
              endDate,
              totalPrice: totalPriceNumber,
              customerName: fullName,
              customerEmail: normalizedEmail,
            }
          : null,
    };
  });

  // E-mail de confirmation hors transaction — absorbe ses propres erreurs.
  if (result.notify) {
    await notifyBookingConfirmed({
      bookingId: result.bookingId,
      ...result.notify,
    });
  }

  return { bookingId: result.bookingId };
}

export interface UpdateBookingPaymentInput {
  amountPaid?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod | null;
  paymentNote?: string | null;
  internalNote?: string | null;
}

/**
 * Met à jour le suivi du règlement d'une réservation (encaissement hors-ligne).
 * L'invariant amountPaid ∈ [0, total] et la cohérence du statut sont garantis
 * par `normalizePayment`.
 */
export async function updateBookingPayment(
  bookingId: string,
  input: UpdateBookingPaymentInput,
) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, totalPrice: true, amountPaid: true, paymentStatus: true },
    });
    if (!booking) {
      throw new Error("Réservation introuvable.");
    }

    const total = Number(booking.totalPrice);
    const nextAmount =
      input.amountPaid !== undefined ? input.amountPaid : Number(booking.amountPaid);
    const payment = normalizePayment(total, nextAmount, input.paymentStatus);

    return tx.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: payment.paymentStatus,
        amountPaid: new Prisma.Decimal(payment.amountPaid),
        ...(input.paymentMethod !== undefined ? { paymentMethod: input.paymentMethod } : {}),
        ...(input.paymentNote !== undefined
          ? { paymentNote: input.paymentNote?.trim().slice(0, 500) || null }
          : {}),
        ...(input.internalNote !== undefined
          ? { internalNote: input.internalNote?.trim().slice(0, 1000) || null }
          : {}),
      },
    });
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
  const updated = await prisma.$transaction(async (tx) => {
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

    return tx.booking.update({
      where: { id: bookingId },
      data: {
        status: nextStatus,
        ...(nextStatus === BookingStatus.DECLINED
          ? { declineReason: declineReason?.trim().slice(0, 500) ?? null }
          : {}),
      },
      include: {
        car: { select: { brand: true, model: true } },
        user: { select: { name: true, email: true } },
      },
    });
  });

  // E-mails au client, hors transaction. Chaque notifier absorbe ses propres
  // erreurs : un e-mail en échec ne doit jamais bloquer la transition.
  if (nextStatus === BookingStatus.CONFIRMED) {
    await notifyBookingConfirmed({
      bookingId: updated.id,
      carBrand: updated.car.brand,
      carModel: updated.car.model,
      startDate: updated.startDate,
      endDate: updated.endDate,
      totalPrice: Number(updated.totalPrice),
      customerName: updated.user.name,
      customerEmail: updated.user.email,
    });
  } else if (nextStatus === BookingStatus.DECLINED) {
    await notifyBookingDeclined({
      bookingId: updated.id,
      carBrand: updated.car.brand,
      carModel: updated.car.model,
      startDate: updated.startDate,
      endDate: updated.endDate,
      customerName: updated.user.name,
      customerEmail: updated.user.email,
      declineReason: updated.declineReason,
    });
  }

  return updated;
}
