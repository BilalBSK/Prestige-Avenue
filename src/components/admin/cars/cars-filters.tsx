"use client";

import { Input } from "@/components/admin/ui/input";
import { Select } from "@/components/admin/ui/select";
import { CarStatus } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Tous statuts" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "DISABLED", label: "Désactivée" },
] satisfies { value: string | CarStatus; label: string }[];

const FEATURED_OPTIONS = [
  { value: "", label: "Toutes" },
  { value: "yes", label: "Mises en avant" },
  { value: "no", label: "Hors mise en avant" },
];

export function CarsFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`/admin/cars?${next.toString()}`);
    },
    [params, router],
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <label className="mb-1 block text-xs text-zinc-500">Recherche</label>
        <Input
          defaultValue={params.get("q") ?? ""}
          placeholder="Marque, modèle, slug"
          onChange={(e) => update("q", e.target.value)}
        />
      </div>
      <div className="w-48">
        <label className="mb-1 block text-xs text-zinc-500">Statut</label>
        <Select
          options={STATUS_OPTIONS}
          defaultValue={params.get("status") ?? ""}
          onChange={(e) => update("status", e.target.value)}
        />
      </div>
      <div className="w-48">
        <label className="mb-1 block text-xs text-zinc-500">Mise en avant</label>
        <Select
          options={FEATURED_OPTIONS}
          defaultValue={params.get("featured") ?? ""}
          onChange={(e) => update("featured", e.target.value)}
        />
      </div>
    </div>
  );
}
