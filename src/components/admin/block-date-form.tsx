"use client";

import { useCsrfToken } from "@/hooks/use-csrf-token";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
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
    if (!response.ok) {
      setErrorMessage(data.error ?? "Blocage impossible.");
      return;
    }

    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4 md:grid-cols-4">
      <select
        name="carId"
        className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
        required
      >
        <option value="">Choisir une voiture</option>
        {cars.map((car) => (
          <option key={car.id} value={car.id}>
            {car.brand} {car.model}
          </option>
        ))}
      </select>
      <input
        type="date"
        name="startDate"
        className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
        required
      />
      <input
        type="date"
        name="endDate"
        className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
        required
      />
      <input
        type="text"
        name="reason"
        placeholder="Raison"
        className="rounded-md border border-zinc-700 bg-black px-3 py-2 text-zinc-100"
        required
      />
      {errorMessage && <p className="text-sm text-red-400 md:col-span-4">{errorMessage}</p>}
      <button
        type="submit"
        disabled={!csrfToken}
        className="rounded-md bg-amber-500 px-4 py-2 font-medium text-black transition hover:bg-amber-400 disabled:opacity-60 md:col-span-4"
      >
        Bloquer la periode
      </button>
    </form>
  );
}
