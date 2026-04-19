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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "./button";
import { toast } from "./toast";

interface MediaGalleryProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  maxItems?: number;
}

function SortableItem({
  url,
  index,
  onRemove,
}: {
  url: string;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
      className="group relative aspect-[4/3] overflow-hidden border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]"
    >
      <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab active:cursor-grabbing">
        <Image src={url} alt="" fill className="object-cover" unoptimized />
      </div>
      <span
        aria-hidden
        className="admin-mono pointer-events-none absolute left-2 top-2 bg-black/70 px-1.5 py-0.5 text-[0.58rem] uppercase tracking-[0.28em] text-[color:var(--admin-accent)]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="admin-mono absolute right-2 top-2 border border-[color:var(--admin-danger)]/60 bg-black/70 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.28em] text-[color:var(--admin-danger-soft)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      >
        Retirer
      </button>
    </div>
  );
}

export function MediaGallery({ value, onChange, folder, maxItems = 12 }: MediaGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function handleFiles(files: FileList) {
    const remaining = maxItems - value.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxItems} images.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
          toast.error(`Fichier ignoré : ${file.name}`);
          continue;
        }
        const blob = await upload(`${folder}/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/admin/upload",
        });
        urls.push(blob.url);
      }
      if (urls.length) {
        onChange([...value, ...urls]);
        toast.success(`${urls.length} image(s) importée(s).`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(String(active.id));
    const newIndex = value.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {value.map((url, i) => (
              <SortableItem
                key={url}
                url={url}
                index={i}
                onRemove={() => onChange(value.filter((u) => u !== url))}
              />
            ))}
            {value.length < maxItems && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="admin-mono group flex aspect-[4/3] flex-col items-center justify-center gap-1 border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]/40 text-[0.58rem] uppercase tracking-[0.36em] text-[color:var(--admin-text-muted)] transition-all duration-500 hover:border-[color:var(--admin-accent)] hover:text-[color:var(--admin-accent)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="text-[1.25rem] leading-none tracking-normal">+</span>
                <span>{uploading ? "Transfert" : "Ajouter"}</span>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex items-center justify-between border-t border-[color:var(--admin-line)] pt-4">
        <p className="admin-mono text-[0.62rem] uppercase tracking-[0.32em] text-[color:var(--admin-text-muted)]">
          <span className="admin-tabular text-[color:var(--admin-text)]">
            {String(value.length).padStart(2, "0")}
          </span>
          <span className="mx-2 text-[color:var(--admin-text-muted)]/50">/</span>
          <span className="admin-tabular">{String(maxItems).padStart(2, "0")}</span>
          <span className="ml-3 text-[color:var(--admin-text-muted)]/70">· glisser pour réordonner</span>
        </p>
        {value.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
            Tout retirer
          </Button>
        )}
      </div>
    </div>
  );
}
