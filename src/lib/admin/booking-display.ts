import {
  BookingSource,
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

/**
 * Source unique de vérité pour l'affichage des réservations dans l'admin :
 * libellés FR, classes de couleur (jetons --admin-*) et formatage. Partagé par
 * la liste des réservations, le planning calendrier et le panneau de détail.
 */

export const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING_REVIEW: "À valider",
  CONFIRMED: "Confirmée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Clôturée",
  CANCELLED: "Annulée",
  DECLINED: "Refusée",
};

/** Pastille de statut (texte + fond translucide). */
export const STATUS_PILL: Record<BookingStatus, string> = {
  PENDING_REVIEW: "bg-[color:var(--admin-warn)]/15 text-[color:var(--admin-warn)]",
  CONFIRMED: "bg-[color:var(--admin-success)]/15 text-[color:var(--admin-success)]",
  IN_PROGRESS: "bg-[color:var(--admin-info)]/15 text-[color:var(--admin-info)]",
  COMPLETED: "bg-[color:var(--admin-info)]/15 text-[color:var(--admin-info)]",
  CANCELLED: "bg-[color:var(--admin-danger)]/15 text-[color:var(--admin-danger)]",
  DECLINED: "bg-[color:var(--admin-danger)]/15 text-[color:var(--admin-danger)]",
};

/** Couleur CSS de la barre du planning, par statut. */
export const STATUS_BAR_COLOR: Record<BookingStatus, string> = {
  PENDING_REVIEW: "var(--admin-warn)",
  CONFIRMED: "var(--admin-success)",
  IN_PROGRESS: "var(--admin-info)",
  COMPLETED: "var(--admin-text-muted)",
  CANCELLED: "var(--admin-danger)",
  DECLINED: "var(--admin-danger)",
};

export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  UNPAID: "Non réglé",
  PARTIAL: "Acompte versé",
  PAID: "Réglé",
};

export const PAYMENT_PILL: Record<PaymentStatus, string> = {
  UNPAID: "bg-[color:var(--admin-danger)]/15 text-[color:var(--admin-danger-soft)]",
  PARTIAL: "bg-[color:var(--admin-warn)]/15 text-[color:var(--admin-warn)]",
  PAID: "bg-[color:var(--admin-success)]/15 text-[color:var(--admin-success)]",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Espèces",
  BANK_TRANSFER: "Virement",
  CARD: "Carte",
  CHECK: "Chèque",
  OTHER: "Autre",
};

export const SOURCE_LABEL: Record<BookingSource, string> = {
  WEBSITE: "Site web",
  PHONE: "Téléphone",
  IN_PERSON: "Sur place",
};

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function formatEUR(amount: number): string {
  return eurFormatter.format(amount);
}

export function formatDateFR(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTimeFR(date: Date): string {
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Référence courte affichée partout (#XXXXXXXX), alignée sur les e-mails. */
export function shortRef(bookingId: string): string {
  return `#${bookingId.slice(-8).toUpperCase()}`;
}

/** Nombre de nuits facturées d'un intervalle demi-ouvert [start, end[. */
export function nightsBetween(start: Date, end: Date): number {
  const ms = end.getTime() - start.getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}
