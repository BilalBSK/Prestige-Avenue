"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { Drawer } from "@/components/admin/ui/drawer";
import { Button } from "@/components/admin/ui/button";
import { confirmDialog } from "@/components/admin/ui/confirm-dialog";
import { toast } from "@/components/admin/ui/toast";
import { PaymentEditor } from "./payment-editor";
import type { ScheduleSegment } from "@/services/calendar.service";
import {
  formatDateFR,
  formatDateTimeFR,
  formatEUR,
  nightsBetween,
  PAYMENT_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_PILL,
  shortRef,
  SOURCE_LABEL,
  STATUS_LABEL,
  STATUS_PILL,
} from "@/lib/admin/booking-display";
import { BookingStatus } from "@prisma/client";

interface SegmentDetailPanelProps {
  segment: ScheduleSegment | null;
  onClose: () => void;
}

const NEXT_STATUS: Partial<Record<BookingStatus, BookingStatus[]>> = {
  PENDING_REVIEW: [BookingStatus.CONFIRMED, BookingStatus.DECLINED],
  CONFIRMED: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  IN_PROGRESS: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
};

export function SegmentDetailPanel({ segment, onClose }: SegmentDetailPanelProps) {
  const csrfToken = useCsrfToken();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!segment) return null;

  const isBlock = segment.kind === "block";

  async function deleteBlock(blockId: string) {
    const ok = await confirmDialog({
      title: "Supprimer cette indisponibilité ?",
      description: "Les dates seront de nouveau réservables pour ce véhicule.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!ok) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/blocked-dates/${blockId}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
      });
      if (!res.ok) {
        toast.error("Suppression impossible.");
        return;
      }
      toast.success("Indisponibilité supprimée.");
      onClose();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function transition(bookingId: string, nextStatus: BookingStatus) {
    let declineReason: string | undefined;
    if (nextStatus === BookingStatus.DECLINED) {
      const reason = window.prompt("Motif du refus (visible côté client) :");
      if (!reason || !reason.trim()) return;
      declineReason = reason.trim();
    }
    const confirmCopy = TRANSITION_CONFIRM[nextStatus];
    if (confirmCopy) {
      const ok = await confirmDialog({
        title: confirmCopy.title,
        description:
          nextStatus === BookingStatus.DECLINED
            ? `Motif : « ${declineReason} »`
            : confirmCopy.description,
        confirmLabel: confirmCopy.confirmLabel,
        variant: confirmCopy.variant,
      });
      if (!ok) return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ status: nextStatus, declineReason }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Mise à jour impossible.");
        return;
      }
      toast.success("Réservation mise à jour.");
      onClose();
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  // ── Indisponibilité ───────────────────────────────────────────────────────
  if (isBlock) {
    return (
      <Drawer
        open
        onClose={onClose}
        title="Indisponibilité"
        eyebrow="Période bloquée"
        footer={
          <div className="flex justify-end">
            <Button
              type="button"
              variant="danger-ghost"
              size="md"
              disabled={!csrfToken}
              loading={busy}
              onClick={() => void deleteBlock(segment.id)}
            >
              Supprimer
            </Button>
          </div>
        }
      >
        <dl className="space-y-px overflow-hidden rounded-lg border border-[color:var(--admin-line)]">
          <Row label="Du" value={formatDateFR(segment.startDate)} />
          <Row label="Au" value={formatDateFR(segment.endDate)} />
          <Row
            label="Durée"
            value={`${nightsBetween(segment.startDate, segment.endDate)} jour(s)`}
          />
          <Row label="Raison" value={segment.reason || "—"} />
        </dl>
      </Drawer>
    );
  }

  // ── Réservation ─────────────────────────────────────────────────────────────
  const nights = nightsBetween(segment.startDate, segment.endDate);
  const transitions = NEXT_STATUS[segment.status] ?? [];
  const remaining = Math.max(0, segment.totalPrice - segment.amountPaid);

  return (
    <Drawer
      open
      onClose={onClose}
      title={segment.customerName}
      eyebrow={shortRef(segment.id)}
    >
      <div className="space-y-4">
        {/* Statuts */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`admin-pill ${STATUS_PILL[segment.status]}`}>
            {STATUS_LABEL[segment.status]}
          </span>
          <span className={`admin-pill ${PAYMENT_PILL[segment.paymentStatus]}`}>
            {PAYMENT_LABEL[segment.paymentStatus]}
          </span>
          <span className="admin-pill bg-[color:var(--admin-surface-2)] text-[color:var(--admin-text-soft)]">
            {SOURCE_LABEL[segment.source]}
          </span>
        </div>

        {/* Client */}
        <Section title="Client">
          <dl className="space-y-px overflow-hidden rounded-lg border border-[color:var(--admin-line)]">
            <Row label="Nom" value={segment.customerName} />
            <Row
              label="E-mail"
              value={
                segment.customerEmail ? (
                  <a
                    href={`mailto:${segment.customerEmail}`}
                    className="text-[color:var(--admin-accent)] hover:underline"
                  >
                    {segment.customerEmail}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Row
              label="Téléphone"
              value={
                segment.customerPhone ? (
                  <a
                    href={`tel:${segment.customerPhone}`}
                    className="text-[color:var(--admin-accent)] hover:underline"
                  >
                    {segment.customerPhone}
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </dl>
        </Section>

        {/* Réservation */}
        <Section title="Réservation">
          <dl className="space-y-px overflow-hidden rounded-lg border border-[color:var(--admin-line)]">
            <Row label="Du" value={formatDateFR(segment.startDate)} />
            <Row label="Au" value={formatDateFR(segment.endDate)} />
            <Row label="Durée" value={`${nights} jour${nights > 1 ? "s" : ""}`} />
            <Row label="Prix total" value={formatEUR(segment.totalPrice)} strong />
            <Row label="Encaissé" value={formatEUR(segment.amountPaid)} />
            {remaining > 0 && (
              <Row
                label="Reste à régler"
                value={
                  <span className="text-[color:var(--admin-warn)]">{formatEUR(remaining)}</span>
                }
              />
            )}
            {segment.paymentMethod && (
              <Row label="Méthode" value={PAYMENT_METHOD_LABEL[segment.paymentMethod]} />
            )}
            <Row label="Reçue le" value={formatDateTimeFR(segment.createdAt)} />
          </dl>
        </Section>

        {segment.customerMessage && (
          <Section title="Message du client">
            <p className="rounded-lg border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] p-3 text-[0.8125rem] italic text-[color:var(--admin-text-soft)]">
              « {segment.customerMessage} »
            </p>
          </Section>
        )}

        {segment.status === BookingStatus.DECLINED && segment.declineReason && (
          <Section title="Motif du refus">
            <p className="rounded-lg border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] p-3 text-[0.8125rem] text-[color:var(--admin-text-soft)]">
              {segment.declineReason}
            </p>
          </Section>
        )}

        {/* Règlement — éditeur */}
        <Section title="Règlement">
          <PaymentEditor
            bookingId={segment.id}
            total={segment.totalPrice}
            amountPaid={segment.amountPaid}
            paymentMethod={segment.paymentMethod}
            paymentNote={segment.paymentNote}
            internalNote={segment.internalNote}
            onSaved={() => {
              onClose();
              router.refresh();
            }}
          />
        </Section>

        {/* Actions de statut */}
        {transitions.length > 0 && (
          <Section title="Actions">
            <div className="flex flex-wrap gap-2">
              {transitions.includes(BookingStatus.CONFIRMED) && (
                <Button type="button" variant="primary" size="md" disabled={!csrfToken || busy} onClick={() => void transition(segment.id, BookingStatus.CONFIRMED)}>
                  Confirmer
                </Button>
              )}
              {transitions.includes(BookingStatus.IN_PROGRESS) && (
                <Button type="button" variant="secondary" size="md" disabled={!csrfToken || busy} onClick={() => void transition(segment.id, BookingStatus.IN_PROGRESS)}>
                  Démarrer
                </Button>
              )}
              {transitions.includes(BookingStatus.COMPLETED) && (
                <Button type="button" variant="secondary" size="md" disabled={!csrfToken || busy} onClick={() => void transition(segment.id, BookingStatus.COMPLETED)}>
                  Clôturer
                </Button>
              )}
              {transitions.includes(BookingStatus.DECLINED) && (
                <Button type="button" variant="danger-ghost" size="md" disabled={!csrfToken || busy} onClick={() => void transition(segment.id, BookingStatus.DECLINED)}>
                  Refuser
                </Button>
              )}
              {transitions.includes(BookingStatus.CANCELLED) && (
                <Button type="button" variant="danger-ghost" size="md" disabled={!csrfToken || busy} onClick={() => void transition(segment.id, BookingStatus.CANCELLED)}>
                  Annuler
                </Button>
              )}
            </div>
          </Section>
        )}
      </div>
    </Drawer>
  );
}

const TRANSITION_CONFIRM: Partial<
  Record<
    BookingStatus,
    { title: string; description: string; confirmLabel: string; variant: "primary" | "danger" }
  >
> = {
  CONFIRMED: {
    title: "Confirmer la réservation ?",
    description: "Les dates seront bloquées pour ce véhicule et le client pourra être notifié.",
    confirmLabel: "Confirmer",
    variant: "primary",
  },
  IN_PROGRESS: {
    title: "Démarrer la location ?",
    description: "Marquer cette réservation comme en cours (clés remises).",
    confirmLabel: "Démarrer",
    variant: "primary",
  },
  COMPLETED: {
    title: "Clôturer la location ?",
    description: "Le véhicule a été restitué et la prestation est terminée.",
    confirmLabel: "Clôturer",
    variant: "primary",
  },
  CANCELLED: {
    title: "Annuler cette réservation ?",
    description: "L'annulation libère les dates pour d'autres demandes.",
    confirmLabel: "Annuler la résa",
    variant: "danger",
  },
  DECLINED: {
    title: "Refuser la demande ?",
    description: "",
    confirmLabel: "Refuser",
    variant: "danger",
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[color:var(--admin-text-muted)]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 bg-[color:var(--admin-surface)] px-3 py-2">
      <dt className="text-[0.75rem] text-[color:var(--admin-text-muted)]">{label}</dt>
      <dd
        className={`admin-tabular text-right text-[0.8125rem] ${
          strong
            ? "font-semibold text-[color:var(--admin-text)]"
            : "text-[color:var(--admin-text-soft)]"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
