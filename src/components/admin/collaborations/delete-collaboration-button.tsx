"use client";

import { confirmDialog } from "@/components/admin/ui/confirm-dialog";
import { toast } from "@/components/admin/ui/toast";
import { deleteCollaboration } from "@/server/admin/collaborations.actions";
import { useTransition } from "react";
import { Button } from "../ui/button";

interface DeleteCollaborationButtonProps {
  collaborationId: string;
  partnerName: string;
}

export function DeleteCollaborationButton({
  collaborationId,
  partnerName,
}: DeleteCollaborationButtonProps) {
  const [pending, startTransition] = useTransition();

  async function onClick() {
    const confirmed = await confirmDialog({
      title: `Supprimer la collaboration ${partnerName} ?`,
      description:
        "Cette suppression est définitive. Les photos disparaîtront du carrousel public.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteCollaboration(collaborationId);
        toast.success("Collaboration supprimée.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur.";
        toast.error(msg);
      }
    });
  }

  return (
    <Button type="button" variant="danger-ghost" size="sm" onClick={onClick} loading={pending}>
      Supprimer
    </Button>
  );
}
