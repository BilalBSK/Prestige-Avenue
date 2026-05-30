"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/sheet";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { getCalendarDayOfWeekISO, parseCalendarDate } from "@/lib/calendar-date";
import { BookingProgress } from "./booking-progress";
import { BookingStepDates } from "./booking-step-dates";
import { BookingStepContact, type ContactValues } from "./booking-step-contact";
import { BookingStepReview } from "./booking-step-review";

interface BookingRequestSheetProps {
  open: boolean;
  onClose: () => void;
  carId: string;
  brand: string;
  model: string;
  pricePerDay: number;
  pricePerKm: number | null;
  weekendPackagePrice: number | null;
}

const STEP_LABELS: [string, string, string] = ["Dates", "Contact", "Confirmation"];

function calculateEstimate(
  startDateValue: string,
  endDateValue: string,
  pricePerDay: number,
  weekendPackagePrice: number | null,
): number {
  if (!startDateValue || !endDateValue) return 0;
  const start = parseCalendarDate(startDateValue);
  const end = parseCalendarDate(endDateValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
    return 0;
  }
  const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (
    days === 3 &&
    getCalendarDayOfWeekISO(start) === 5 &&
    getCalendarDayOfWeekISO(end) === 1 &&
    weekendPackagePrice !== null
  ) {
    return Number(weekendPackagePrice.toFixed(2));
  }
  return Number((days * pricePerDay).toFixed(2));
}

export function BookingRequestSheet({
  open,
  onClose,
  carId,
  brand,
  model,
  pricePerDay,
  pricePerKm,
  weekendPackagePrice,
}: BookingRequestSheetProps) {
  const router = useRouter();
  const csrfToken = useCsrfToken();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [contact, setContact] = useState<ContactValues>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    customerMessage: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const submissionTokenRef = useRef<string>("");

  const estimatedTotal = useMemo(
    () => calculateEstimate(startDate, endDate, pricePerDay, weekendPackagePrice),
    [startDate, endDate, pricePerDay, weekendPackagePrice],
  );

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleSubmit() {
    if (submitting) return;
    if (!csrfToken) {
      setServerError("Jeton de sécurité manquant. Rechargez la page.");
      return;
    }
    setSubmitting(true);
    setServerError("");

    if (!submissionTokenRef.current) {
      submissionTokenRef.current = crypto.randomUUID();
    }

    try {
      const response = await fetch("/api/bookings/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({
          carId,
          firstName: contact.firstName.trim(),
          lastName: contact.lastName.trim(),
          email: contact.email.trim(),
          phone: contact.phone.trim(),
          startDate,
          endDate,
          customerMessage: contact.customerMessage.trim() || undefined,
          submissionToken: submissionTokenRef.current,
        }),
      });

      const data = (await response.json()) as { bookingId?: string; error?: string };
      if (!response.ok || !data.bookingId) {
        setServerError(data.error ?? "Erreur lors de l'envoi de la demande.");
        setSubmitting(false);
        return;
      }

      router.push(`/booking/confirmation/${data.bookingId}`);
    } catch {
      setServerError("Connexion indisponible. Réessayez dans un instant.");
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onClose={handleClose} ariaLabel="Réservation">
      <header className="flex-shrink-0 border-b border-[var(--ink-line)] px-5 pb-7 pt-8 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
              <span className="mr-3 inline-block h-px w-6 bg-[var(--ink-dim)] align-middle" />
              Réservation
            </p>
            <h2 className="mt-4 truncate font-[family:var(--font-fraunces)] text-[28px] font-light leading-[1.15] tracking-[-0.02em] text-[var(--ink-ivory)]">
              {brand} <em className="italic font-normal">{model}.</em>
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Fermer"
            className="-mr-2 -mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center font-[family:var(--font-fraunces)] text-[16px] text-[var(--ink-text-soft)] transition-colors duration-200 hover:text-[var(--ink-ivory)] disabled:opacity-50"
          >
            ✕
          </button>
        </div>
        <div className="mt-7">
          <BookingProgress currentStep={step} labels={STEP_LABELS} />
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <div key={step} className="booking-step-fade h-full">
          {step === 1 && (
            <BookingStepDates
              carId={carId}
              pricePerDay={pricePerDay}
              pricePerKm={pricePerKm}
              weekendPackagePrice={weekendPackagePrice}
              startDate={startDate}
              endDate={endDate}
              onChange={(next) => {
                setStartDate(next.startDate);
                setEndDate(next.endDate);
              }}
              onContinue={() => setStep(2)}
              estimatedTotal={estimatedTotal}
            />
          )}
          {step === 2 && (
            <BookingStepContact
              values={contact}
              onChange={setContact}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <BookingStepReview
              brand={brand}
              model={model}
              startDate={startDate}
              endDate={endDate}
              estimatedTotal={estimatedTotal}
              pricePerKm={pricePerKm}
              contact={contact}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
              submitting={submitting}
              serverError={serverError}
            />
          )}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-[var(--ink-onyx)] to-transparent"
        />
      </div>
    </Sheet>
  );
}
