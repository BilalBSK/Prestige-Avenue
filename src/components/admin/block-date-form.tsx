"use client";

import { useCsrfToken } from "@/hooks/use-csrf-token";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface CarOption {
  id: string;
  brand: string;
  model: string;
}

interface BlockDateFormProps {
  cars: CarOption[];
}

export function BlockDateForm({ cars }: BlockDateFormProps) {
  const csrfToken = useCsrfToken();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setPending(true);
    const formData = new FormData(event.currentTarget);
    const payload = {
      carId: String(formData.get("carId") ?? ""),
      startDate: new Date(String(formData.get("startDate"))).toISOString(),
      endDate: new Date(String(formData.get("endDate"))).toISOString(),
      reason: String(formData.get("reason") ?? ""),
    };

    const response = await fetch("/api/admin/blocked-dates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setErrorMessage(data.error ?? "Blocage impossible.");
      return;
    }

    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] p-4"
    >
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_1.3fr_auto]">
        <select
          name="carId"
          className="h-9 w-full appearance-none rounded-md border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] px-3 text-[0.8125rem] text-[color:var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-[color:var(--admin-accent)]/40"
          required
        >
          <option value="">Véhicule…</option>
          {cars.map((car) => (
            <option key={car.id} value={car.id}>
              {car.brand} {car.model}
            </option>
          ))}
        </select>
        <Input type="date" name="startDate" required />
        <Input type="date" name="endDate" required />
        <Input type="text" name="reason" placeholder="Raison (maintenance, usage interne…)" required />
        <Button type="submit" size="md" disabled={!csrfToken} loading={pending}>
          Bloquer
        </Button>
      </div>
      {errorMessage && (
        <p className="mt-3 text-[0.8125rem] text-[color:var(--admin-danger-soft)]">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
