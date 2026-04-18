"use client";

import { useCsrfToken } from "@/hooks/use-csrf-token";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CarStatusActionsProps {
  carId: string;
}

export function CarStatusActions({ carId }: CarStatusActionsProps) {
  const csrfToken = useCsrfToken();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function setDisabled() {
    setIsLoading(true);
    await fetch(`/api/admin/cars/${carId}`, {
      method: "DELETE",
      headers: {
        "x-csrf-token": csrfToken,
      },
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void setDisabled()}
      disabled={!csrfToken || isLoading}
      className="rounded-md border border-red-500/50 px-3 py-1 text-xs text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
    >
      Desactiver
    </button>
  );
}
