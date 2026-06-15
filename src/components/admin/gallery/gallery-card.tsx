"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTransition } from "react";
import { GALLERY_RATIO_OPTIONS } from "@/lib/home/gallery-items";
import { confirmDialog } from "@/components/admin/ui/confirm-dialog";
import { DragHandle } from "@/components/admin/ui/drag-handle";
import { toast } from "@/components/admin/ui/toast";
import {
  deleteGalleryItem,
  toggleGalleryItemPublished,
} from "@/server/admin/home-gallery.actions";
import { GalleryTilePreview } from "./gallery-tile-preview";
import type { GalleryItemRow } from "./gallery-manager";

interface GalleryCardProps {
  row: GalleryItemRow;
  index: number;
  onEdit: () => void;
}

const RATIO_LABEL = Object.fromEntries(
  GALLERY_RATIO_OPTIONS.map((o) => [o.value, o.label]),
) as Record<GalleryItemRow["ratio"], string>;

/**
 * Carte d'une tuile dans la grille admin : aperçu fidèle au vrai ratio (pour
 * lire le rythme réel des colonnes), poignée de glissé, badge d'ordre, chips
 * type + format, et actions au survol (éditer, publier/masquer, supprimer).
 * Une tuile masquée est grisée pour signaler qu'elle n'apparaît pas en ligne.
 */
export function GalleryCard({ row, index, onEdit }: GalleryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleGalleryItemPublished(row.id);
        toast.success(row.isPublished ? "Tuile masquée." : "Tuile publiée.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur.");
      }
    });
  }

  async function handleDelete() {
    const confirmed = await confirmDialog({
      title: "Supprimer cette tuile ?",
      description:
        "Cette suppression est définitive. Le visuel disparaîtra de la galerie d'accueil.",
      confirmLabel: "Supprimer",
      variant: "danger",
    });
    if (!confirmed) return;
    startTransition(async () => {
      try {
        await deleteGalleryItem(row.id);
        toast.success("Tuile supprimée.");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur.");
      }
    });
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`admin-media-tile group relative rounded-xl border bg-[color:var(--admin-bg-elev)] p-2 transition-colors ${
        isDragging
          ? "border-[color:var(--admin-accent)]/60"
          : "border-[color:var(--admin-line-strong)]"
      } ${pending ? "pointer-events-none opacity-60" : ""}`}
    >
      {/* --- Aperçu fidèle (figé sur poster pour les vidéos) --- */}
      <div className={row.isPublished ? "" : "opacity-40 grayscale"}>
        <GalleryTilePreview
          mediaType={row.mediaType}
          src={row.src}
          poster={row.poster}
          alt={row.alt}
          ratio={row.ratio}
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
        />
      </div>

      {/* --- Poignée de glissé (coin haut-gauche) --- */}
      <DragHandle {...attributes} {...listeners} className="absolute left-3 top-3" />

      {/* --- Badge d'ordre (coin haut-droit) --- */}
      <span
        aria-hidden
        className="admin-tabular absolute right-3 top-3 flex h-7 min-w-7 items-center justify-center rounded-md bg-black/65 px-1.5 text-[0.75rem] font-semibold text-white backdrop-blur-sm"
      >
        {index + 1}
      </span>

      {/* --- Actions (publier / éditer / supprimer) — toujours visibles au doigt,
              révélées au survol sur souris (cf. .admin-media-controls). --- */}
      <div className="admin-media-controls absolute right-3 top-12 flex flex-col gap-1.5">
        <CardAction
          label={row.isPublished ? "Masquer" : "Publier"}
          onClick={handleToggle}
        >
          {row.isPublished ? (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="8" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.3" />
              <path d="m3 13 10-10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4Z" stroke="currentColor" strokeWidth="1.3" />
              <circle cx="8" cy="8" r="1.6" stroke="currentColor" strokeWidth="1.3" />
            </svg>
          )}
        </CardAction>
        <CardAction label="Éditer" onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M11 2.5 13.5 5 6 12.5l-3 .5.5-3L11 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
        </CardAction>
        <CardAction label="Supprimer" danger onClick={handleDelete}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </CardAction>
      </div>

      {/* --- Pied : chips type + format, alt tronqué --- */}
      <div className="px-1 pb-1 pt-2.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--admin-surface-2)] px-2 py-0.5 text-[0.6875rem] font-medium text-[color:var(--admin-text-soft)]">
            {row.mediaType === "VIDEO" ? "Vidéo" : "Photo"}
          </span>
          <span className="inline-flex items-center rounded-full bg-[color:var(--admin-surface-2)] px-2 py-0.5 text-[0.6875rem] font-medium text-[color:var(--admin-text-soft)]">
            {RATIO_LABEL[row.ratio]}
          </span>
          {!row.isPublished && (
            <span className="inline-flex items-center rounded-full bg-[color:var(--admin-surface-2)] px-2 py-0.5 text-[0.6875rem] font-medium text-[color:var(--admin-text-muted)]">
              Masquée
            </span>
          )}
        </div>
        <p className="mt-1.5 truncate text-[0.75rem] text-[color:var(--admin-text-muted)]" title={row.alt}>
          {row.alt}
        </p>
      </div>
    </div>
  );
}

function CardAction({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-7 w-7 items-center justify-center rounded-md bg-black/65 backdrop-blur-sm transition-colors hover:bg-black/80 coarse:h-9 coarse:w-9 ${
        danger ? "text-white hover:text-[color:var(--admin-danger-soft)]" : "text-white/90"
      }`}
    >
      {children}
    </button>
  );
}
