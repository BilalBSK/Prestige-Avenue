"use client";

import { Button } from "@/components/admin/ui/button";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-6">
      <h2 className="text-lg font-semibold text-red-100">Une erreur est survenue</h2>
      <p className="text-sm text-red-200/80">
        Le chargement de cette page a échoué. Vous pouvez réessayer ou revenir au tableau de bord.
      </p>
      <Button variant="secondary" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
