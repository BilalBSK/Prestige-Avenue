"use client";

import { useCsrfToken } from "@/hooks/use-csrf-token";
import { useRouter } from "next/navigation";

interface BlockedDateDeleteButtonProps {
  blockedDateId: string;
}

export function BlockedDateDeleteButton({ blockedDateId }: BlockedDateDeleteButtonProps) {
  const csrfToken = useCsrfToken();
  const router = useRouter();

  async function removeBlockedDate() {
    await fetch(`/api/admin/blocked-dates/${blockedDateId}`, {
      method: "DELETE",
      headers: {
        "x-csrf-token": csrfToken,
      },
    });
    router.refresh();
  }

  return (
    <button
      type="button"
      disabled={!csrfToken}
      onClick={() => void removeBlockedDate()}
      className="rounded border border-red-500/50 px-3 py-1 text-xs text-red-300"
    >
      Supprimer
    </button>
  );
}
