"use client";

import { useCsrfToken } from "@/hooks/use-csrf-token";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";

interface BlockedDateDeleteButtonProps {
  blockedDateId: string;
}

export function BlockedDateDeleteButton({ blockedDateId }: BlockedDateDeleteButtonProps) {
  const csrfToken = useCsrfToken();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function removeBlockedDate() {
    setPending(true);
    await fetch(`/api/admin/blocked-dates/${blockedDateId}`, {
      method: "DELETE",
      headers: {
        "x-csrf-token": csrfToken,
      },
    });
    setPending(false);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="danger-ghost"
      size="sm"
      disabled={!csrfToken}
      loading={pending}
      onClick={() => void removeBlockedDate()}
    >
      Supprimer
    </Button>
  );
}
