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
  { label: "", width: "w-8" },
  { label: "", width: "w-12" },
  { label: "Véhicule", align: "text-left" },
  { label: "Catégorie", align: "text-left" },
  { label: "État", align: "text-left" },
  { label: "Tarif", align: "text-right" },
  { label: "Week-end", align: "text-right" },
  { label: "Vitrine", align: "text-center" },
  { label: "", width: "w-20" },
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
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] px-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--admin-surface-2)] text-[color:var(--admin-text-muted)]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 14H3v-3l2-5h10l2 5v3h-2M7 14a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0zM13 14a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0-3 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-3 text-[0.9375rem] font-medium text-[color:var(--admin-text)]">
          Aucun véhicule
        </p>
        <p className="mt-1 text-[0.8125rem] text-[color:var(--admin-text-muted)]">
          Ajustez vos filtres ou ajoutez un nouveau véhicule à la flotte.
        </p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="overflow-hidden rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse">
              <thead>
                <tr className="border-b border-[color:var(--admin-line)] bg-[color:var(--admin-surface)]">
                  {HEADERS.map((h, i) => (
                    <th
                      key={i}
                      className={`px-3 py-2.5 text-[0.75rem] font-medium text-[color:var(--admin-text-muted)] ${
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
        </div>
      </SortableContext>
    </DndContext>
  );
}
