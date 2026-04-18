"use client";

import { useCsrfToken } from "@/hooks/use-csrf-token";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, addMonths, eachDayOfInterval, format, isWeekend } from "date-fns";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const bookingSchema = z
  .object({
    firstName: z.string().min(2, "Prenom requis"),
    lastName: z.string().min(2, "Nom requis"),
    email: z.email("Email invalide"),
    phone: z.string().min(8, "Telephone requis"),
    startDate: z.string().min(1, "Date de debut requise"),
    endDate: z.string().min(1, "Date de fin requise"),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "La date de fin doit etre apres la date de debut",
    path: ["endDate"],
  });

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  carId: string;
  pricePerDay: number;
  weekendPrice: number | null;
  depositAmount: number;
}

function calculateEstimate(
  startDateValue: string | undefined,
  endDateValue: string | undefined,
  pricePerDay: number,
  weekendPrice: number | null,
) {
  if (!startDateValue || !endDateValue) {
    return 0;
  }

  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
    return 0;
  }

  const days = eachDayOfInterval({
    start: startDate,
    end: addDays(endDate, -1),
  });

  return days.reduce((acc, day) => {
    if (isWeekend(day) && weekendPrice !== null) {
      return acc + weekendPrice;
    }
    return acc + pricePerDay;
  }, 0);
}

export function BookingForm({
  carId,
  pricePerDay,
  weekendPrice,
  depositAmount,
}: BookingFormProps) {
  const csrfToken = useCsrfToken();
  const [serverError, setServerError] = useState<string>("");
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      startDate: "",
      endDate: "",
    },
  });

  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const minStartDate = format(new Date(), "yyyy-MM-dd");
  const maxStartDate = format(addMonths(new Date(), 2), "yyyy-MM-dd");
  const maxEndDate = format(addDays(addMonths(new Date(), 2), 1), "yyyy-MM-dd");

  const estimatedTotal = useMemo(
    () => calculateEstimate(startDate, endDate, pricePerDay, weekendPrice),
    [startDate, endDate, pricePerDay, weekendPrice],
  );
  const estimatedDeposit = useMemo(() => Number((estimatedTotal * 0.4).toFixed(2)), [estimatedTotal]);
  const estimatedRemaining = useMemo(
    () => Number((estimatedTotal - estimatedDeposit).toFixed(2)),
    [estimatedDeposit, estimatedTotal],
  );

  async function checkAvailability(start: string, end: string) {
    setAvailabilityMessage("Verification en cours...");
    setIsAvailable(null);

    const response = await fetch(
      `/api/cars/${carId}/availability?startDate=${encodeURIComponent(
        new Date(start).toISOString(),
      )}&endDate=${encodeURIComponent(new Date(end).toISOString())}`,
      { cache: "no-store" },
    );
    const data = (await response.json()) as { isAvailable: boolean; reason?: string };

    setIsAvailable(data.isAvailable);
    setAvailabilityMessage(
      data.isAvailable ? "Periode disponible." : data.reason ?? "Periode indisponible.",
    );
  }

  async function onSubmit(values: BookingFormValues) {
    setServerError("");

    if (!isAvailable) {
      setServerError("Veuillez choisir une periode disponible.");
      return;
    }

    const response = await fetch("/api/bookings/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({
        carId,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        submissionToken: crypto.randomUUID(),
      }),
    });

    const data = (await response.json()) as { checkoutUrl?: string; error?: string };
    if (!response.ok || !data.checkoutUrl) {
      setServerError(data.error ?? "Erreur de reservation.");
      return;
    }

    window.location.href = data.checkoutUrl;
  }

  return (
    <form
      className="lux-panel space-y-4 p-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Prenom</label>
          <input type="text" className="lux-input" {...form.register("firstName")} />
          {form.formState.errors.firstName && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Nom</label>
          <input type="text" className="lux-input" {...form.register("lastName")} />
          {form.formState.errors.lastName && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Email</label>
          <input type="email" className="lux-input" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Telephone</label>
          <input type="tel" className="lux-input" {...form.register("phone")} />
          {form.formState.errors.phone && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Date de debut</label>
          <input
            type="date"
            className="lux-input"
            min={minStartDate}
            max={maxStartDate}
            {...form.register("startDate")}
            onBlur={() => {
              const s = form.getValues("startDate");
              const e = form.getValues("endDate");
              if (s && e) {
                void checkAvailability(s, e);
              }
            }}
          />
          {form.formState.errors.startDate && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.startDate.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-300">Date de fin</label>
          <input
            type="date"
            className="lux-input"
            min={minStartDate}
            max={maxEndDate}
            {...form.register("endDate")}
            onBlur={() => {
              const s = form.getValues("startDate");
              const e = form.getValues("endDate");
              if (s && e) {
                void checkAvailability(s, e);
              }
            }}
          />
          {form.formState.errors.endDate && (
            <p className="mt-1 text-xs text-red-400">{form.formState.errors.endDate.message}</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800/90 bg-black/30 p-4 text-sm text-zinc-200">
        <p>Prix estime: {estimatedTotal.toFixed(2)} EUR</p>
        <p>Acompte a payer (40%): {estimatedDeposit.toFixed(2)} EUR</p>
        <p>Solde restant: {estimatedRemaining.toFixed(2)} EUR</p>
        <p className="text-xs text-zinc-500">Caution vehicule: {depositAmount.toFixed(2)} EUR</p>
        <p className="mt-2 text-xs text-zinc-400">
          Regles: weekend uniquement du vendredi au lundi, reservations 1 jour uniquement du lundi
          au jeudi et entre J+7 et J+14.
        </p>
        <p className={isAvailable ? "text-emerald-400" : "text-zinc-400"}>{availabilityMessage}</p>
      </div>

      {serverError && <p className="text-sm text-red-400">{serverError}</p>}

      <button
        type="submit"
        disabled={form.formState.isSubmitting || !csrfToken}
        className="lux-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {form.formState.isSubmitting ? "Redirection..." : "Payer l'acompte"}
      </button>
    </form>
  );
}
