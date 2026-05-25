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
    <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center">
      <div className="relative flex-1">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[color:var(--admin-text-muted)]"
        >
          <circle cx="6" cy="6" r="4.25" stroke="currentColor" strokeWidth="1.25" />
          <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
        </svg>
        <Input
          defaultValue={params.get("q") ?? ""}
          placeholder="Rechercher par marque, modèle, slug…"
          className="pl-8"
          onChange={(e) => update("q", e.target.value)}
        />
      </div>
      <div className="w-full md:w-48">
        <Select
          options={STATUS_OPTIONS}
          defaultValue={params.get("status") ?? ""}
          onChange={(e) => update("status", e.target.value)}
        />
      </div>
      <div className="w-full md:w-44">
        <Select
          options={FEATURED_OPTIONS}
          defaultValue={params.get("featured") ?? ""}
          onChange={(e) => update("featured", e.target.value)}
        />
      </div>
    </div>
  );
}
