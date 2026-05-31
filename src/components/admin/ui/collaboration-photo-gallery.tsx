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
import Image from "next/image";
import { useRef, useState } from "react";
import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_SIZE_BYTES } from "@/lib/blob";
import { uploadImageToR2 } from "@/lib/upload-client";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import type { CollaborationPhoto } from "@/server/admin/collaborations.schema";
import { Button } from "./button";
import { toast } from "./toast";

const ALLOWED_MIMES: readonly string[] = ALLOWED_IMAGE_MIMES;

interface CollaborationPhotoGalleryProps {
  value: CollaborationPhoto[];
  onChange: (photos: CollaborationPhoto[]) => void;
  folder: string;
  maxItems?: number;
}

/** Lit les dimensions naturelles d'un fichier image avant upload. */
async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  // createImageBitmap : rapide, sans pollution du DOM, large support navigateur.
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      const dims = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dims;
    } catch {
      // Repli sur l'élément Image ci-dessous.
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const dims = { width: img.naturalWidth, height: img.naturalHeight };
      URL.revokeObjectURL(url);
      resolve(dims);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible."));
    };
    img.src = url;
  });
}

function SortableItem({
  photo,
  index,
  onRemove,
}: {
  photo: CollaborationPhoto;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.url,
  });
  const isPortrait = photo.height > photo.width;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
      className="group relative aspect-[4/3] overflow-hidden rounded-md border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)]"
    >
      <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab active:cursor-grabbing">
        <Image
          src={photo.url}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover"
        />
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[0.6875rem] font-medium text-white"
      >
        {index + 1}
      </span>

      <span
        aria-hidden
        className="pointer-events-none absolute bottom-1.5 left-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-wide text-white/90"
      >
        {isPortrait ? "Portrait" : "Paysage"}
      </span>

      <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onRemove}
          className="flex h-6 w-6 items-center justify-center rounded-md bg-black/75 text-white hover:bg-[color:var(--admin-danger)]"
          aria-label="Retirer"
          title="Retirer"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function CollaborationPhotoGallery({
  value,
  onChange,
  folder,
  maxItems = 20,
}: CollaborationPhotoGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const csrfToken = useCsrfToken();

  async function handleFiles(files: FileList) {
    const remaining = maxItems - value.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxItems} photos.`);
      return;
    }
    if (!csrfToken) {
      toast.error("Session non prête, réessayez dans un instant.");
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const added: CollaborationPhoto[] = [];
      for (const file of toUpload) {
        if (!ALLOWED_MIMES.includes(file.type)) {
          toast.error(`${file.name} : format non supporté (JPEG, PNG, WebP, AVIF).`);
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          toast.error(`${file.name} : trop volumineux (max 5 Mo).`);
          continue;
        }
        let dimensions: { width: number; height: number };
        try {
          dimensions = await readImageDimensions(file);
        } catch {
          toast.error(`${file.name} : image illisible.`);
          continue;
        }
        const url = await uploadImageToR2({ file, folder, csrfToken, scope: "collaborations" });
        added.push({ url, width: dimensions.width, height: dimensions.height });
      }
      if (added.length) {
        onChange([...value, ...added]);
        toast.success(`${added.length} photo(s) importée(s).`);
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
    const oldIndex = value.findIndex((p) => p.url === active.id);
    const newIndex = value.findIndex((p) => p.url === over.id);
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
        <SortableContext items={value.map((p) => p.url)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {value.map((photo, i) => (
              <SortableItem
                key={photo.url}
                photo={photo}
                index={i}
                onRemove={() => onChange(value.filter((p) => p.url !== photo.url))}
              />
            ))}
            {value.length < maxItems && (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="group flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text-muted)] transition-colors hover:border-[color:var(--admin-accent)]/60 hover:bg-[color:var(--admin-surface-2)] hover:text-[color:var(--admin-text-soft)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-[0.75rem] font-medium">
                  {uploading ? "Transfert…" : "Ajouter"}
                </span>
              </button>
            )}
          </div>
        </SortableContext>
      </DndContext>
      <div className="flex items-center justify-between">
        <p className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
          <span className="admin-tabular text-[color:var(--admin-text-soft)]">{value.length}</span>
          <span className="mx-1">/</span>
          <span className="admin-tabular">{maxItems}</span>
          <span className="ml-2">· glisser pour réordonner</span>
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
