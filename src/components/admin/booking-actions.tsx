"use client";

import { useCsrfToken } from "@/hooks/use-csrf-token";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BookingActionsProps {
  bookingId: string;
}

export function BookingActions({ bookingId }: BookingActionsProps) {
  const csrfToken = useCsrfToken();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(status: "CONFIRMED" | "CANCELLED" | "COMPLETED") {
    setIsLoading(true);
    await fetch(`/api/admin/bookings/${bookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      body: JSON.stringify({ status }),
    });
    setIsLoading(false);
    router.refresh();
  }

  async function refund() {
    setIsLoading(true);
    await fetch(`/api/admin/bookings/${bookingId}/refund`, {
      method: "POST",
      headers: {
        "x-csrf-token": csrfToken,
      },
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={!csrfToken || isLoading}
        onClick={() => void updateStatus("CONFIRMED")}
        className="rounded border border-emerald-500/50 px-2 py-1 text-xs text-emerald-300"
      >
        Confirmer
      </button>
      <button
        type="button"
        disabled={!csrfToken || isLoading}
        onClick={() => void updateStatus("CANCELLED")}
        className="rounded border border-red-500/50 px-2 py-1 text-xs text-red-300"
      >
        Annuler
      </button>
      <button
        type="button"
        disabled={!csrfToken || isLoading}
        onClick={() => void updateStatus("COMPLETED")}
        className="rounded border border-blue-500/50 px-2 py-1 text-xs text-blue-300"
      >
        Cloturer
      </button>
      <button
        type="button"
        disabled={!csrfToken || isLoading}
        onClick={() => void refund()}
        className="rounded border border-amber-500/50 px-2 py-1 text-xs text-amber-300"
      >
        Rembourser
      </button>
    </div>
  );
}
