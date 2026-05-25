"use client";

import { useCsrfToken } from "@/hooks/use-csrf-token";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookingStatus } from "@prisma/client";
import { Button } from "./ui/button";
import { confirmDialog } from "./ui/confirm-dialog";
import { toast } from "./ui/toast";

interface BookingActionsProps {
  bookingId: string;
  status: BookingStatus;
}

const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING_REVIEW: [BookingStatus.CONFIRMED, BookingStatus.DECLINED],
  CONFIRMED: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  IN_PROGRESS: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
  COMPLETED: [],
  CANCELLED: [],
  DECLINED: [],
};

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const csrfToken = useCsrfToken();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const allowed = ALLOWED_TRANSITIONS[status];

  async function transition(nextStatus: BookingStatus, declineReason?: string) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ status: nextStatus, declineReason }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        toast.error(data.error ?? "Mise à jour impossible.");
        return;
      }
      toast.success("Réservation mise à jour.");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirm() {
    const ok = await confirmDialog({
      title: "Confirmer la réservation ?",
      description:
        "Le client recevra une confirmation. Les dates seront bloquées pour ce véhicule.",
      confirmLabel: "Confirmer",
      variant: "primary",
    });
    if (ok) await transition(BookingStatus.CONFIRMED);
  }

  async function handleDecline() {
    const reason = window.prompt("Motif du refus (visible côté client) :");
    if (!reason || reason.trim().length === 0) return;
    const ok = await confirmDialog({
      title: "Refuser la demande ?",
      description: `Motif : « ${reason.trim()} »`,
      confirmLabel: "Refuser",
      variant: "danger",
    });
    if (ok) await transition(BookingStatus.DECLINED, reason.trim());
  }

  async function handleStart() {
    const ok = await confirmDialog({
      title: "Démarrer la location ?",
      description: "Marquer cette réservation comme en cours (clés remises).",
      confirmLabel: "Démarrer",
      variant: "primary",
    });
    if (ok) await transition(BookingStatus.IN_PROGRESS);
  }

  async function handleComplete() {
    const ok = await confirmDialog({
      title: "Clôturer la location ?",
      description: "Le véhicule a été restitué et la prestation est terminée.",
      confirmLabel: "Clôturer",
      variant: "primary",
    });
    if (ok) await transition(BookingStatus.COMPLETED);
  }

  async function handleCancel() {
    const ok = await confirmDialog({
      title: "Annuler cette réservation ?",
      description: "L'annulation libère les dates pour d'autres demandes.",
      confirmLabel: "Annuler la résa",
      cancelLabel: "Garder",
      variant: "danger",
    });
    if (ok) await transition(BookingStatus.CANCELLED);
  }

  if (allowed.length === 0) {
    return (
      <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-[color:var(--admin-text-muted)]">
        — clos —
      </span>
    );
  }

  const disabled = !csrfToken || isLoading;

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {allowed.includes(BookingStatus.CONFIRMED) && (
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={disabled}
          onClick={() => void handleConfirm()}
        >
          Confirmer
        </Button>
      )}
      {allowed.includes(BookingStatus.DECLINED) && (
        <Button
          type="button"
          variant="danger-ghost"
          size="sm"
          disabled={disabled}
          onClick={() => void handleDecline()}
        >
          Refuser
        </Button>
      )}
      {allowed.includes(BookingStatus.IN_PROGRESS) && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => void handleStart()}
        >
          Démarrer
        </Button>
      )}
      {allowed.includes(BookingStatus.COMPLETED) && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => void handleComplete()}
        >
          Clôturer
        </Button>
      )}
      {allowed.includes(BookingStatus.CANCELLED) && (
        <Button
          type="button"
          variant="danger-ghost"
          size="sm"
          disabled={disabled}
          onClick={() => void handleCancel()}
        >
          Annuler
        </Button>
      )}
    </div>
  );
}
