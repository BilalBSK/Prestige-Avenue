"use client";

import { confirmDialog } from "@/components/admin/ui/confirm-dialog";
import { toast } from "@/components/admin/ui/toast";
import { Button } from "@/components/admin/ui/button";
import { deleteAdminUser } from "@/server/admin/team.actions";
import { useTransition } from "react";

interface DeleteAdminButtonProps {
  adminId: string;
  adminName: string;
}

export function DeleteAdminButton({ adminId, adminName }: DeleteAdminButtonProps) {
  const [pending, startTransition] = useTransition();

  async function onClick() {
    const confirmed = await confirmDialog({
      title: `Supprimer l'administrateur ${adminName} ?`,
      description:
        "Cette personne perdra immédiatement l'accès au back-office. Cette action est définitive.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        await deleteAdminUser(adminId);
        toast.success(`Accès de ${adminName} supprimé.`);
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
