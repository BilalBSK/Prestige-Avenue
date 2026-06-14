"use client";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useTransition } from "react";
import type { GalleryMediaType, GalleryRatio } from "@prisma/client";
import { Button } from "@/components/admin/ui/button";
import { toast } from "@/components/admin/ui/toast";
import {
  reorderGalleryItems,
  seedDemoGallery,
} from "@/server/admin/home-gallery.actions";
import { GalleryCard } from "./gallery-card";
import { GalleryItemEditor } from "./gallery-item-editor";

/** Forme d'une tuile telle que passée du serveur au client (sérialisable). */
export interface GalleryItemRow {
  id: string;
  mediaType: GalleryMediaType;
  src: string;
  poster: string | null;
  alt: string;
  ratio: GalleryRatio;
  isPublished: boolean;
}

// Sentinelle de l'éditeur : `undefined` = fermé, `null` = création, objet = édition.
type EditorTarget = GalleryItemRow | null | undefined;

export function GalleryManager({ initialItems }: { initialItems: GalleryItemRow[] }) {
  const [items, setItems] = useState(initialItems);
  const [editorTarget, setEditorTarget] = useState<EditorTarget>(undefined);
  const [, startReorder] = useTransition();
  const [seeding, startSeeding] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(items, oldIndex, newIndex);
    const previous = items;
    setItems(next); // optimiste
    startReorder(async () => {
      try {
        await reorderGalleryItems(next.map((i) => i.id));
        toast.success("Ordre mis à jour.");
      } catch (err) {
        setItems(previous); // rollback
        toast.error(err instanceof Error ? err.message : "Erreur.");
      }
    });
  }

  function handleSeed() {
    startSeeding(async () => {
      try {
        const { inserted } = await seedDemoGallery();
        toast.success(
          inserted > 0
            ? `${inserted} tuiles de démonstration importées.`
            : "La galerie contient déjà des tuiles.",
        );
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur à l'import.");
      }
    });
  }

  // --- État vide ---
  if (items.length === 0) {
    return (
      <>
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--admin-surface-2)] text-[color:var(--admin-text-muted)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="m3.5 16.5 4.5-4 3.5 3 3-2.5 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="mt-4 text-[0.9375rem] font-medium text-[color:var(--admin-text)]">
            Galerie vide
          </p>
          <p className="mt-1 max-w-md text-[0.8125rem] text-[color:var(--admin-text-muted)]">
            Ajoutez vos visuels pour alimenter la section « Notre univers » de la
            page d&apos;accueil, ou partez de la galerie de démonstration et
            remplacez-la à votre rythme.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <Button type="button" variant="primary" size="md" onClick={() => setEditorTarget(null)}>
              Ajouter un visuel
            </Button>
            <Button type="button" variant="secondary" size="md" onClick={handleSeed} loading={seeding}>
              Importer la galerie de démonstration
            </Button>
          </div>
        </div>

        {editorTarget !== undefined && (
          <GalleryItemEditor item={editorTarget} onClose={() => setEditorTarget(undefined)} />
        )}
      </>
    );
  }

  // --- Grille peuplée ---
  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[0.8125rem] text-[color:var(--admin-text-muted)]">
          <span className="admin-tabular text-[color:var(--admin-text-soft)]">{items.length}</span>{" "}
          tuile{items.length > 1 ? "s" : ""} · glissez pour réordonner
        </p>
        <Button type="button" variant="primary" size="md" onClick={() => setEditorTarget(null)}>
          Ajouter un visuel
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((row, index) => (
              <GalleryCard
                key={row.id}
                row={row}
                index={index}
                onEdit={() => setEditorTarget(row)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {editorTarget !== undefined && (
        <GalleryItemEditor item={editorTarget} onClose={() => setEditorTarget(undefined)} />
      )}
    </>
  );
}
