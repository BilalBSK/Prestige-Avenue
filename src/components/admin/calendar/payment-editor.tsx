"use client";

import { useState } from "react";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Select } from "@/components/admin/ui/select";
import { Textarea } from "@/components/admin/ui/textarea";
import { Field } from "@/components/admin/ui/field";
import { toast } from "@/components/admin/ui/toast";
import { PAYMENT_METHOD_LABEL, formatEUR } from "@/lib/admin/booking-display";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

interface PaymentEditorProps {
  bookingId: string;
  total: number;
  amountPaid: number;
  paymentMethod: PaymentMethod | null;
  paymentNote: string | null;
  internalNote: string | null;
  onSaved: () => void;
}

const METHOD_OPTIONS = [
  { value: "", label: "Méthode…" },
  ...Object.values(PaymentMethod).map((m) => ({ value: m, label: PAYMENT_METHOD_LABEL[m] })),
];

export function PaymentEditor({
  bookingId,
  total,
  amountPaid,
  paymentMethod,
  paymentNote,
  internalNote,
  onSaved,
}: PaymentEditorProps) {
  const csrfToken = useCsrfToken();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(amountPaid));
  const [method, setMethod] = useState<string>(paymentMethod ?? "");
  const [note, setNote] = useState(paymentNote ?? "");
  const [internal, setInternal] = useState(internalNote ?? "");
  const [pending, setPending] = useState(false);

  if (!open) {
    return (
      <Button type="button" variant="secondary" size="md" onClick={() => setOpen(true)}>
        Modifier le règlement
      </Button>
    );
  }

  function quickFill(value: number) {
    setAmount(String(value));
  }

  async function save() {
    const parsedAmount = Number(amount.replace(",", "."));
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error("Montant encaissé invalide.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({
          amountPaid: parsedAmount,
          paymentMethod: method ? method : null,
          paymentNote: note,
          internalNote: internal,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Mise à jour impossible.");
        return;
      }
      toast.success("Règlement mis à jour.");
      onSaved();
    } finally {
      setPending(false);
    }
  }

  const previewStatus = (() => {
    const a = Number(amount.replace(",", "."));
    if (Number.isNaN(a) || a <= 0) return PaymentStatus.UNPAID;
    if (a >= total) return PaymentStatus.PAID;
    return PaymentStatus.PARTIAL;
  })();

  return (
    <div className="space-y-3 rounded-lg border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] p-3">
      <Field label="Montant encaissé" htmlFor="payment-amount" hint={`sur ${formatEUR(total)}`}>
        <Input
          id="payment-amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </Field>

      <div className="flex flex-wrap gap-1.5">
        <QuickButton label="Aucun" onClick={() => quickFill(0)} />
        <QuickButton label="50 %" onClick={() => quickFill(Math.round(total * 0.5))} />
        <QuickButton label="Solde total" onClick={() => quickFill(total)} />
      </div>

      <Field label="Méthode" htmlFor="payment-method">
        <Select
          id="payment-method"
          options={METHOD_OPTIONS}
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        />
      </Field>

      <Field label="Note de règlement" htmlFor="payment-note">
        <Textarea
          id="payment-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ex. solde réglé à la remise des clés"
        />
      </Field>

      <Field label="Note interne (agence)" htmlFor="internal-note">
        <Textarea
          id="internal-note"
          rows={2}
          value={internal}
          onChange={(e) => setInternal(e.target.value)}
          placeholder="Visible uniquement par l'agence"
        />
      </Field>

      <p className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
        Nouveau statut :{" "}
        <span className="font-medium text-[color:var(--admin-text-soft)]">
          {previewStatus === "PAID" ? "Réglé" : previewStatus === "PARTIAL" ? "Acompte versé" : "Non réglé"}
        </span>
      </p>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="md" onClick={() => setOpen(false)} disabled={pending}>
          Annuler
        </Button>
        <Button type="button" variant="primary" size="md" disabled={!csrfToken} loading={pending} onClick={() => void save()}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}

function QuickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] px-2.5 py-1 text-[0.75rem] text-[color:var(--admin-text-soft)] transition-colors hover:bg-[color:var(--admin-surface-2)] hover:text-[color:var(--admin-text)]"
    >
      {label}
    </button>
  );
}
