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
import { Car } from "@prisma/client";
import { useState, useTransition } from "react";
import { CarsListRow } from "./cars-list-row";

interface CarsListProps {
  cars: (Car & { _bookingCount: number })[];
}

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
      <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center text-sm text-zinc-400">
        Aucune voiture ne correspond à ces filtres.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm">
        <thead className="bg-zinc-950 text-left text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="w-10 px-2 py-3"></th>
            <th className="w-16 px-2 py-3"></th>
            <th className="px-3 py-3">Véhicule</th>
            <th className="px-3 py-3">Catégorie</th>
            <th className="px-3 py-3">Statut</th>
            <th className="px-3 py-3 text-right">Prix/jour</th>
            <th className="px-3 py-3 text-right">Week-end</th>
            <th className="px-3 py-3 text-center">Featured</th>
            <th className="px-3 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {items.map((car) => (
                <CarsListRow key={car.id} car={car} bookingCount={car._bookingCount} />
              ))}
            </SortableContext>
          </DndContext>
        </tbody>
      </table>
    </div>
  );
}
