"use client";

import { Switch } from "@/components/admin/ui/switch";
import { toast } from "@/components/admin/ui/toast";
import { toggleCarFeatured } from "@/server/admin/cars.actions";
import { useState, useTransition } from "react";

interface ToggleFeaturedSwitchProps {
  carId: string;
  initial: boolean;
}

export function ToggleFeaturedSwitch({ carId, initial }: ToggleFeaturedSwitchProps) {
  const [checked, setChecked] = useState(initial);
  const [pending, startTransition] = useTransition();

  function onChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      try {
        await toggleCarFeatured(carId);
      } catch (err) {
        setChecked(!next);
        const msg = err instanceof Error ? err.message : "Erreur.";
        toast.error(msg);
      }
    });
  }

  return (
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={pending}
      aria-label="Mettre en avant"
    />
  );
}
