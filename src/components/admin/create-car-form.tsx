"use client";

export function CreateCarForm() {
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-100">
      <p className="font-medium">Création de véhicule temporairement indisponible</p>
      <p className="mt-1 text-amber-100/80">
        Le formulaire de création est en cours de refonte pour prendre en charge les nouvelles
        informations de véhicule (puissance, forfait week-end, conditions de location, etc.). En
        attendant, un administrateur peut ajouter des véhicules directement via le seed ou l&apos;API.
      </p>
    </div>
  );
}
