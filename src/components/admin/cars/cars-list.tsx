"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "@/components/admin/ui/toast";
import { reorderCars } from "@/server/admin/cars.actions";
import { useState, useTransition } from "react";
import { CarsListRow, type CarRow } from "./cars-list-row";

interface CarsListProps {
  cars: CarRow[];
}

const HEADERS = [
  { label: "", width: "w-12" },
  { label: "", width: "w-14" },
  { label: "", width: "w-20" },
  { label: "Véhicule", align: "text-left" },
  { label: "Catégorie", align: "text-left" },
  { label: "État", align: "text-left" },
  { label: "Tarif", align: "text-right" },
  { label: "Week-end", align: "text-right" },
  { label: "Vitrine", align: "text-center" },
  { label: "Actions", align: "text-right" },
] as const;

export function CarsList({ cars }: CarsListProps) {
  const [items, setItems] = useState(cars);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(items, oldIndex, newIndex);
    const previous = items;
    setItems(next);
    startTransition(async () => {
      try {
        await reorderCars(next.map((c) => c.id));
        toast.success("Ordre mis à jour.");
      } catch (err) {
        setItems(previous);
        const msg = err instanceof Error ? err.message : "Erreur.";
        toast.error(msg);
      }
    });
  }

  if (!items.length) {
    return (
      <div className="admin-fade-up flex min-h-[280px] flex-col items-center justify-center border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]/40 px-10 text-center">
        <p className="admin-mono text-[0.6rem] uppercase tracking-[0.36em] text-[color:var(--admin-accent)]">
          Collection vide
        </p>
        <p className="admin-serif mt-3 text-[1.5rem] italic leading-tight tracking-tight text-[color:var(--admin-text)]">
          Aucun véhicule ne correspond
        </p>
        <p className="mt-2 text-[0.85rem] text-[color:var(--admin-text-muted)]">
          Ajustez vos filtres ou constituez une nouvelle pièce au catalogue.
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="admin-fade-up overflow-x-auto border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]/40">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr className="border-b border-[color:var(--admin-line-strong)]">
                {HEADERS.map((h, i) => (
                  <th
                    key={i}
                    className={`admin-mono px-4 py-4 text-[0.58rem] font-normal uppercase tracking-[0.32em] text-[color:var(--admin-text-muted)]/70 ${
                      "align" in h ? h.align : ""
                    } ${"width" in h ? h.width : ""}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((car, i) => (
                <CarsListRow
                  key={car.id}
                  car={car}
                  index={i}
                  bookingCount={car.bookingCount}
                />
              ))}
            </tbody>
          </table>
        </div>
      </SortableContext>
    </DndContext>
  );
}
