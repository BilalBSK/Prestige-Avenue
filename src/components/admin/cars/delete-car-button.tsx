"use client";

import { confirmDialog } from "@/components/admin/ui/confirm-dialog";
import { toast } from "@/components/admin/ui/toast";
import { deleteCar } from "@/server/admin/cars.actions";
import { useTransition } from "react";

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
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="admin-mono px-3 py-2 text-[0.62rem] uppercase tracking-[0.28em] text-[color:var(--admin-text-muted)] transition-colors duration-300 hover:text-[color:var(--admin-danger-soft)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {pending ? "···" : "Supprimer"}
    </button>
  );
}
