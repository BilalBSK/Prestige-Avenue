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

function SortableItem({ url, onRemove }: { url: string; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: url });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="group relative h-32 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
    >
      <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab">
        <Image src={url} alt="" fill className="object-cover" unoptimized />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded bg-black/70 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
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
    <div className="space-y-3">
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {value.map((url) => (
              <SortableItem
                key={url}
                url={url}
                onRemove={() => onChange(value.filter((u) => u !== url))}
              />
            ))}
            {value.length < maxItems && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex h-32 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-950 text-xs text-zinc-400 hover:border-zinc-500"
              >
                {uploading ? "Upload..." : "Ajouter"}
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <p className="text-xs text-zinc-500">
        {value.length}/{maxItems} images · Glissez-déposez pour réordonner
      </p>
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([])}>
        Tout retirer
      </Button>
    </div>
  );
}
