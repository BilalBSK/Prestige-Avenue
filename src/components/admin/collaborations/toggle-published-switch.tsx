"use client";

import { Switch } from "@/components/admin/ui/switch";
import { toast } from "@/components/admin/ui/toast";
import { toggleCollaborationPublished } from "@/server/admin/collaborations.actions";
import { useState, useTransition } from "react";

interface TogglePublishedSwitchProps {
  collaborationId: string;
  initial: boolean;
}

export function TogglePublishedSwitch({ collaborationId, initial }: TogglePublishedSwitchProps) {
  const [checked, setChecked] = useState(initial);
  const [pending, startTransition] = useTransition();

  function onChange(next: boolean) {
    setChecked(next);
    startTransition(async () => {
      try {
        await toggleCollaborationPublished(collaborationId);
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
      aria-label="Publier la collaboration"
    />
  );
}
