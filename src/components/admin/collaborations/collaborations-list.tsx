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
import Link from "next/link";
import { useState, useTransition } from "react";
import { buttonVariants } from "@/components/admin/ui/button-variants";
import { toast } from "@/components/admin/ui/toast";
import { reorderCollaborations } from "@/server/admin/collaborations.actions";
import {
  CollaborationsListCard,
  CollaborationsListRow,
  type CollaborationRow,
} from "./collaborations-list-row";

const HEADERS = [
  { label: "", width: "w-8" },
  { label: "", width: "w-12" },
  { label: "Partenaire", align: "text-left" },
  { label: "Photos", align: "text-right" },
  { label: "Publiée", align: "text-center" },
  { label: "", width: "w-20" },
] as const;

export function CollaborationsList({ collaborations }: { collaborations: CollaborationRow[] }) {
  const [items, setItems] = useState(collaborations);
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
        await reorderCollaborations(next.map((c) => c.id));
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
            <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="7.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 14l4-3 3 2 3-3 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mt-3 text-[0.9375rem] font-medium text-[color:var(--admin-text)]">
          Aucune collaboration
        </p>
        <p className="mt-1 text-[0.8125rem] text-[color:var(--admin-text-muted)]">
          Ajoutez une première collaboration pour alimenter le carrousel partenaires.
        </p>
        <Link
          href="/admin/collaborations/new"
          className={`mt-4 ${buttonVariants({ variant: "primary", size: "md" })}`}
        >
          Ajouter une collaboration
        </Link>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="hidden overflow-hidden rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse">
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
                {items.map((row) => (
                  <CollaborationsListRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:hidden">
          {items.map((row) => (
            <CollaborationsListCard key={row.id} row={row} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
