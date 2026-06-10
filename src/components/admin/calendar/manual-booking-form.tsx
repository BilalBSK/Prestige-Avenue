"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { Drawer } from "@/components/admin/ui/drawer";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { Select } from "@/components/admin/ui/select";
import { Textarea } from "@/components/admin/ui/textarea";
import { Field } from "@/components/admin/ui/field";
import { Switch } from "@/components/admin/ui/switch";
import { toast } from "@/components/admin/ui/toast";
import { PAYMENT_METHOD_LABEL } from "@/lib/admin/booking-display";
import { BookingSource, BookingStatus, PaymentMethod } from "@prisma/client";

export interface CarOption {
  id: string;
  brand: string;
  model: string;
}

interface ManualBookingFormProps {
  open: boolean;
  onClose: () => void;
  cars: CarOption[];
}

const STATUS_OPTIONS = [
  { value: BookingStatus.CONFIRMED, label: "Confirmée (bloque les dates)" },
  { value: BookingStatus.PENDING_REVIEW, label: "À valider (ne bloque pas)" },
];

const SOURCE_OPTIONS = [
  { value: BookingSource.PHONE, label: "Téléphone" },
  { value: BookingSource.IN_PERSON, label: "Sur place" },
];

const METHOD_OPTIONS = [
  { value: "", label: "Méthode…" },
  ...Object.values(PaymentMethod).map((m) => ({ value: m, label: PAYMENT_METHOD_LABEL[m] })),
];

interface FormState {
  carId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  startDate: string;
  endDate: string;
  totalPrice: string;
  initialStatus: BookingStatus;
  source: BookingSource;
  amountPaid: string;
  paymentMethod: string;
  paymentNote: string;
  internalNote: string;
  sendConfirmationEmail: boolean;
}

const INITIAL: FormState = {
  carId: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  startDate: "",
  endDate: "",
  totalPrice: "",
  initialStatus: BookingStatus.CONFIRMED,
  source: BookingSource.PHONE,
  amountPaid: "",
  paymentMethod: "",
  paymentNote: "",
  internalNote: "",
  sendConfirmationEmail: false,
};

export function ManualBookingForm({ open, onClose, cars }: ManualBookingFormProps) {
  const csrfToken = useCsrfToken();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const carOptions = [
    { value: "", label: "Sélectionner un véhicule…" },
    ...cars.map((c) => ({ value: c.id, label: `${c.brand} ${c.model}` })),
  ];

  const canEmail = Boolean(form.customerEmail.trim());
  const emailToggleEnabled = canEmail && form.initialStatus === BookingStatus.CONFIRMED;

  function validate(): string | null {
    if (!form.carId) return "Sélectionnez un véhicule.";
    if (form.customerName.trim().length < 2) return "Le nom du client est requis.";
    if (!form.customerEmail.trim() && !form.customerPhone.trim()) {
      return "Renseignez au moins un e-mail ou un téléphone.";
    }
    if (!form.startDate || !form.endDate) return "Renseignez les dates de début et de fin.";
    if (new Date(form.endDate) <= new Date(form.startDate)) {
      return "La date de fin doit être postérieure à la date de début.";
    }
    return null;
  }

  async function submit() {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    try {
      const payload = {
        carId: form.carId,
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim() || undefined,
        customerPhone: form.customerPhone.trim() || undefined,
        startDate: form.startDate,
        endDate: form.endDate,
        totalPrice: form.totalPrice.trim() ? Number(form.totalPrice.replace(",", ".")) : undefined,
        initialStatus: form.initialStatus,
        source: form.source,
        amountPaid: form.amountPaid.trim() ? Number(form.amountPaid.replace(",", ".")) : undefined,
        paymentMethod: form.paymentMethod || undefined,
        paymentNote: form.paymentNote.trim() || undefined,
        internalNote: form.internalNote.trim() || undefined,
        sendConfirmationEmail: emailToggleEnabled && form.sendConfirmationEmail,
      };

      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Création impossible.");
        return;
      }
      toast.success("Réservation créée.");
      setForm(INITIAL);
      onClose();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Nouvelle réservation"
      eyebrow="Saisie manuelle"
      footer={
        <div className="flex items-center justify-between gap-3">
          {error ? (
            <p className="text-[0.75rem] text-[color:var(--admin-danger-soft)]">{error}</p>
          ) : (
            <span />
          )}
          <div className="flex shrink-0 gap-2">
            <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={pending}>
              Annuler
            </Button>
            <Button type="button" variant="primary" size="md" disabled={!csrfToken} loading={pending} onClick={() => void submit()}>
              Créer la réservation
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <FormSection title="Véhicule & période">
          <Field label="Véhicule" htmlFor="mb-car" required>
            <Select
              id="mb-car"
              options={carOptions}
              value={form.carId}
              onChange={(e) => set("carId", e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date de début" htmlFor="mb-start" required>
              <Input
                id="mb-start"
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </Field>
            <Field label="Date de fin" htmlFor="mb-end" required>
              <Input
                id="mb-end"
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
              />
            </Field>
          </div>
          <p className="text-[0.6875rem] text-[color:var(--admin-text-muted)]">
            En saisie manuelle, les règles du site (week-ends, délais) ne s&apos;appliquent pas.
            Seul le chevauchement avec une réservation confirmée ou une indisponibilité est refusé.
          </p>
        </FormSection>

        <FormSection title="Client">
          <Field label="Nom complet" htmlFor="mb-name" required>
            <Input
              id="mb-name"
              value={form.customerName}
              onChange={(e) => set("customerName", e.target.value)}
              placeholder="Prénom Nom"
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Téléphone" htmlFor="mb-phone">
              <Input
                id="mb-phone"
                type="tel"
                value={form.customerPhone}
                onChange={(e) => set("customerPhone", e.target.value)}
                placeholder="06 12 34 56 78"
              />
            </Field>
            <Field label="E-mail" htmlFor="mb-email" hint="Optionnel">
              <Input
                id="mb-email"
                type="email"
                value={form.customerEmail}
                onChange={(e) => set("customerEmail", e.target.value)}
                placeholder="client@email.fr"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Réservation">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Statut initial" htmlFor="mb-status">
              <Select
                id="mb-status"
                options={STATUS_OPTIONS}
                value={form.initialStatus}
                onChange={(e) => set("initialStatus", e.target.value as BookingStatus)}
              />
            </Field>
            <Field label="Origine" htmlFor="mb-source">
              <Select
                id="mb-source"
                options={SOURCE_OPTIONS}
                value={form.source}
                onChange={(e) => set("source", e.target.value as BookingSource)}
              />
            </Field>
          </div>
          <Field
            label="Prix total (€)"
            htmlFor="mb-price"
            hint="Laissez vide pour le tarif standard calculé automatiquement"
          >
            <Input
              id="mb-price"
              inputMode="decimal"
              value={form.totalPrice}
              onChange={(e) => set("totalPrice", e.target.value)}
              placeholder="Auto"
            />
          </Field>
        </FormSection>

        <FormSection title="Règlement (hors-ligne)">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Montant encaissé (€)" htmlFor="mb-paid">
              <Input
                id="mb-paid"
                inputMode="decimal"
                value={form.amountPaid}
                onChange={(e) => set("amountPaid", e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="Méthode" htmlFor="mb-method">
              <Select
                id="mb-method"
                options={METHOD_OPTIONS}
                value={form.paymentMethod}
                onChange={(e) => set("paymentMethod", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Note de règlement" htmlFor="mb-paynote">
            <Textarea
              id="mb-paynote"
              rows={2}
              value={form.paymentNote}
              onChange={(e) => set("paymentNote", e.target.value)}
              placeholder="ex. acompte versé par virement, solde à la remise"
            />
          </Field>
        </FormSection>

        <FormSection title="Note interne">
          <Field label="Visible uniquement par l'agence" htmlFor="mb-internal">
            <Textarea
              id="mb-internal"
              rows={2}
              value={form.internalNote}
              onChange={(e) => set("internalNote", e.target.value)}
            />
          </Field>
        </FormSection>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] p-3">
          <div className="min-w-0">
            <p className="text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
              Envoyer l&apos;e-mail de confirmation
            </p>
            <p className="mt-0.5 text-[0.75rem] text-[color:var(--admin-text-muted)]">
              {canEmail
                ? form.initialStatus === BookingStatus.CONFIRMED
                  ? "Le client recevra le récapitulatif par e-mail."
                  : "Disponible uniquement pour une réservation confirmée."
                : "Renseignez un e-mail pour activer l'envoi."}
            </p>
          </div>
          <Switch
            checked={emailToggleEnabled && form.sendConfirmationEmail}
            onCheckedChange={(v) => set("sendConfirmationEmail", v)}
            disabled={!emailToggleEnabled}
            aria-label="Envoyer l'e-mail de confirmation"
          />
        </div>
      </div>
    </Drawer>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[color:var(--admin-text-muted)]">
        {title}
      </h3>
      {children}
    </section>
  );
}
