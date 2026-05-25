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
import { Button } from "./button";
import { toast } from "./toast";

const ALLOWED_MIMES: readonly string[] = ALLOWED_IMAGE_MIMES;

interface MediaGalleryProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  maxItems?: number;
  mainImage?: string;
  onSetMain?: (url: string) => void;
}

function SortableItem({
  url,
  index,
  isMain,
  onRemove,
  onSetMain,
}: {
  url: string;
  index: number;
  isMain: boolean;
  onRemove: () => void;
  onSetMain?: () => void;
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
      className={`group relative aspect-[4/3] overflow-hidden rounded-md border bg-[color:var(--admin-surface)] ${
        isMain
          ? "border-[color:var(--admin-accent)] ring-2 ring-[color:var(--admin-accent)]/40"
          : "border-[color:var(--admin-line-strong)]"
      }`}
    >
      <div {...attributes} {...listeners} className="absolute inset-0 cursor-grab active:cursor-grabbing">
        <Image src={url} alt="" fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-cover" />
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute left-1.5 top-1.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[0.6875rem] font-medium text-white"
      >
        {index + 1}
      </span>

      {isMain && (
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-md bg-[color:var(--admin-accent)] px-1.5 py-0.5 text-[0.6875rem] font-medium text-black">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M5 1L6.2 3.6L9 4L7 6L7.5 9L5 7.5L2.5 9L3 6L1 4L3.8 3.6L5 1Z" fill="currentColor" />
          </svg>
          Principale
        </span>
      )}

      <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {onSetMain && !isMain && (
          <button
            type="button"
            onClick={onSetMain}
            className="flex h-6 items-center gap-1 rounded-md bg-black/75 px-1.5 text-[0.6875rem] font-medium text-white hover:bg-[color:var(--admin-accent)] hover:text-black"
            aria-label="Définir comme image principale"
            title="Définir comme image principale"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M5 1L6.2 3.6L9 4L7 6L7.5 9L5 7.5L2.5 9L3 6L1 4L3.8 3.6L5 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
            </svg>
            Principale
          </button>
        )}
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

export function MediaGallery({
  value,
  onChange,
  folder,
  maxItems = 12,
  mainImage,
  onSetMain,
}: MediaGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const csrfToken = useCsrfToken();

  async function handleFiles(files: FileList) {
    const remaining = maxItems - value.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxItems} images.`);
      return;
    }
    if (!csrfToken) {
      toast.error("Session non prête, réessayez dans un instant.");
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of toUpload) {
        if (!ALLOWED_MIMES.includes(file.type)) {
          toast.error(`${file.name} : format non supporté (JPEG, PNG, WebP, AVIF).`);
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          toast.error(`${file.name} : trop volumineux (max 5 Mo).`);
          continue;
        }
        const publicUrl = await uploadImageToR2({ file, folder, csrfToken });
        urls.push(publicUrl);
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
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {value.map((url, i) => (
              <SortableItem
                key={url}
                url={url}
                index={i}
                isMain={url === mainImage}
                onRemove={() => onChange(value.filter((u) => u !== url))}
                onSetMain={onSetMain ? () => onSetMain(url) : undefined}
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
