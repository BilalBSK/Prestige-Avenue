"use client";

import { Input } from "@/components/admin/ui/input";
import { Select } from "@/components/admin/ui/select";
import { CarStatus } from "@prisma/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const STATUS_OPTIONS = [
  { value: "", label: "Tous les statuts" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "DISABLED", label: "Désactivée" },
] satisfies { value: string | CarStatus; label: string }[];

const FEATURED_OPTIONS = [
  { value: "", label: "Toute la flotte" },
  { value: "yes", label: "En vitrine" },
  { value: "no", label: "Hors vitrine" },
];

function FilterLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="admin-mono mb-2 block text-[0.58rem] uppercase tracking-[0.32em] text-[color:var(--admin-text-muted)]">
      {children}
    </label>
  );
}

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
    <div className="admin-fade-up admin-fade-up-d1 grid gap-6 border border-[color:var(--admin-line)] bg-[color:var(--admin-bg-elev)]/30 px-6 py-5 md:grid-cols-[1fr_14rem_14rem]">
      <div>
        <FilterLabel>Recherche</FilterLabel>
        <Input
          defaultValue={params.get("q") ?? ""}
          placeholder="Marque, modèle, finition, slug…"
          onChange={(e) => update("q", e.target.value)}
        />
      </div>
      <div>
        <FilterLabel>Statut</FilterLabel>
        <Select
          options={STATUS_OPTIONS}
          defaultValue={params.get("status") ?? ""}
          onChange={(e) => update("status", e.target.value)}
        />
      </div>
      <div>
        <FilterLabel>Mise en avant</FilterLabel>
        <Select
          options={FEATURED_OPTIONS}
          defaultValue={params.get("featured") ?? ""}
          onChange={(e) => update("featured", e.target.value)}
        />
      </div>
    </div>
  );
}
