"use client";

import { confirmDialog } from "@/components/admin/ui/confirm-dialog";
import { toast } from "@/components/admin/ui/toast";
import { deleteCar } from "@/server/admin/cars.actions";
import { useTransition } from "react";
import { Button } from "../ui/button";

interface DeleteCarButtonProps {
  carId: string;
  carLabel: string;
  hasBookings: boolean;
}

export function DeleteCarButton({ carId, carLabel, hasBookings }: DeleteCarButtonProps) {
  const [pending, startTransition] = useTransition();

  async function onClick() {
    const confirmed = await confirmDialog({
      title: `Supprimer ${carLabel} ?`,
      description: hasBookings
        ? "Ce véhicule sera retiré du catalogue et masqué du site. Les réservations existantes sont conservées."
        : "Cette suppression est définitive — aucune réservation ne s'y rattache.",
      confirmLabel: hasBookings ? "Désactiver" : "Supprimer",
      variant: "danger",
    });
    if (!confirmed) return;

    startTransition(async () => {
      try {
        const { softDeleted } = await deleteCar(carId);
        toast.success(softDeleted ? "Véhicule désactivé." : "Véhicule supprimé.");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur.";
        toast.error(msg);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="danger-ghost"
      size="sm"
      onClick={onClick}
      loading={pending}
    >
      Supprimer
    </Button>
  );
}
