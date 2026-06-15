"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_SIZE_BYTES } from "@/lib/blob";
import {
  SHOT_ANGLES,
  SHOT_GROUPS,
  type CarShot,
  type ShotAngle,
  type ShotGroup,
} from "@/lib/cars/shots";
import { uploadImageToR2 } from "@/lib/upload-client";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { Button } from "./button";
import { toast } from "./toast";

const ALLOWED_MIMES: readonly string[] = ALLOWED_IMAGE_MIMES;
const MAX_PER_ANGLE = 8;

interface ShotsEditorProps {
  value: CarShot[];
  onChange: (shots: CarShot[]) => void;
  folder: string;
  /** Couverture courante — une vignette peut être promue couverture. */
  mainImage?: string;
  onSetMain?: (url: string) => void;
}

/** Images rattachées à un angle dans la valeur courante. */
function imagesForAngle(value: CarShot[], angle: ShotAngle): string[] {
  return value.find((s) => s.angle === angle)?.images ?? [];
}

/** Réécrit les images d'un angle et renvoie la liste réordonnée canoniquement. */
function withAngleImages(
  value: CarShot[],
  angle: ShotAngle,
  images: string[],
): CarShot[] {
  const map = new Map<ShotAngle, string[]>(value.map((s) => [s.angle, s.images]));
  if (images.length > 0) map.set(angle, images);
  else map.delete(angle);
  return SHOT_ANGLES.filter((d) => map.has(d.angle)).map((d) => ({
    angle: d.angle,
    images: map.get(d.angle) as string[],
  }));
}

function Thumb({
  url,
  isMain,
  canMoveLeft,
  canMoveRight,
  onMove,
  onRemove,
  onSetMain,
}: {
  url: string;
  isMain: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onSetMain?: () => void;
}) {
  return (
    <div
      className={`admin-media-tile relative aspect-[4/3] w-[104px] shrink-0 overflow-hidden rounded-md border bg-[color:var(--admin-surface)] coarse:w-[132px] ${
        isMain
          ? "border-[color:var(--admin-accent)] ring-1 ring-[color:var(--admin-accent)]/40"
          : "border-[color:var(--admin-line-strong)]"
      }`}
    >
      <Image src={url} alt="" fill sizes="(pointer: coarse) 132px, 104px" className="object-cover" />

      {isMain && (
        <span className="pointer-events-none absolute bottom-1 left-1 inline-flex items-center gap-1 rounded bg-[color:var(--admin-accent)] px-1.5 py-0.5 text-[0.625rem] font-medium text-black">
          <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path d="M5 1L6.2 3.6L9 4L7 6L7.5 9L5 7.5L2.5 9L3 6L1 4L3.8 3.6L5 1Z" fill="currentColor" />
          </svg>
          Couverture
        </span>
      )}

      {/* Réordonnancement intra-angle par flèches (toujours visible au doigt,
          révélé au survol souris) — robuste et accessible, sans glissé. */}
      <div className="admin-media-controls absolute inset-x-1 bottom-1 flex justify-center gap-1">
        {canMoveLeft && (
          <button
            type="button"
            onClick={() => onMove(-1)}
            className="flex h-6 w-6 items-center justify-center rounded bg-black/75 text-white hover:bg-[color:var(--admin-accent)] hover:text-black coarse:h-8 coarse:w-8"
            aria-label="Déplacer vers la gauche"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M7.5 2.5L4 6l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {canMoveRight && (
          <button
            type="button"
            onClick={() => onMove(1)}
            className="flex h-6 w-6 items-center justify-center rounded bg-black/75 text-white hover:bg-[color:var(--admin-accent)] hover:text-black coarse:h-8 coarse:w-8"
            aria-label="Déplacer vers la droite"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 2.5L8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      <div className="admin-media-controls absolute right-1 top-1 flex gap-1">
        {onSetMain && !isMain && (
          <button
            type="button"
            onClick={onSetMain}
            className="flex h-6 w-6 items-center justify-center rounded bg-black/75 text-white hover:bg-[color:var(--admin-accent)] hover:text-black coarse:h-8 coarse:w-8"
            aria-label="Définir comme couverture"
            title="Définir comme couverture"
          >
            <svg width="11" height="11" viewBox="0 0 10 10" fill="none" aria-hidden>
              <path d="M5 1L6.2 3.6L9 4L7 6L7.5 9L5 7.5L2.5 9L3 6L1 4L3.8 3.6L5 1Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          className="flex h-6 w-6 items-center justify-center rounded bg-black/75 text-white hover:bg-[color:var(--admin-danger)] coarse:h-8 coarse:w-8"
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

export function ShotsEditor({
  value,
  onChange,
  folder,
  mainImage,
  onSetMain,
}: ShotsEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingAngle, setUploadingAngle] = useState<ShotAngle | null>(null);
  const pendingAngle = useRef<ShotAngle | null>(null);
  const csrfToken = useCsrfToken();

  const totalPhotos = value.reduce((acc, s) => acc + s.images.length, 0);
  const coveredAngles = value.filter((s) => s.images.length > 0).length;

  function openPicker(angle: ShotAngle) {
    pendingAngle.current = angle;
    inputRef.current?.click();
  }

  async function handleFiles(files: FileList) {
    const angle = pendingAngle.current;
    if (!angle) return;
    const current = imagesForAngle(value, angle);
    const remaining = MAX_PER_ANGLE - current.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_PER_ANGLE} photos par prise de vue.`);
      return;
    }
    if (!csrfToken) {
      toast.error("Session non prête, réessayez dans un instant.");
      return;
    }

    const toUpload = Array.from(files).slice(0, remaining);
    setUploadingAngle(angle);
    try {
      const uploaded: string[] = [];
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
        uploaded.push(publicUrl);
      }
      if (uploaded.length > 0) {
        onChange(withAngleImages(value, angle, [...current, ...uploaded]));
        toast.success(`${uploaded.length} photo(s) ajoutée(s).`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload.";
      toast.error(msg);
    } finally {
      setUploadingAngle(null);
      pendingAngle.current = null;
    }
  }

  function removeImage(angle: ShotAngle, url: string) {
    onChange(withAngleImages(value, angle, imagesForAngle(value, angle).filter((u) => u !== url)));
  }

  function moveImage(angle: ShotAngle, index: number, dir: -1 | 1) {
    const images = [...imagesForAngle(value, angle)];
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];
    onChange(withAngleImages(value, angle, images));
  }

  return (
    <div className="space-y-5">
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

      {SHOT_GROUPS.map((groupDef: { group: ShotGroup; label: string }) => {
        const angles = SHOT_ANGLES.filter((d) => d.group === groupDef.group);
        const groupCount = angles.reduce(
          (acc, d) => acc + imagesForAngle(value, d.angle).length,
          0,
        );
        return (
          <div key={groupDef.group} className="space-y-3">
            <div className="flex items-center gap-3">
              <h3 className="text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--admin-text-soft)]">
                {groupDef.label}
              </h3>
              <span className="h-px flex-1 bg-[color:var(--admin-line)]" />
              <span className="admin-tabular text-[0.6875rem] text-[color:var(--admin-text-muted)]">
                {groupCount} photo{groupCount > 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-px overflow-hidden rounded-lg border border-[color:var(--admin-line)] bg-[color:var(--admin-line)] sm:grid-cols-2">
              {angles.map((def) => {
                const images = imagesForAngle(value, def.angle);
                const busy = uploadingAngle === def.angle;
                const full = images.length >= MAX_PER_ANGLE;
                return (
                  <div
                    key={def.angle}
                    className="flex flex-col gap-2.5 bg-[color:var(--admin-bg-elev)] p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
                          {def.label}
                          {images.length > 0 && (
                            <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--admin-accent-dim)] px-1 text-[0.625rem] font-semibold text-[color:var(--admin-accent)]">
                              {images.length}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 truncate text-[0.6875rem] text-[color:var(--admin-text-muted)]">
                          {def.hint}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {images.map((url, i) => (
                        <Thumb
                          key={url}
                          url={url}
                          isMain={url === mainImage}
                          canMoveLeft={i > 0}
                          canMoveRight={i < images.length - 1}
                          onMove={(dir) => moveImage(def.angle, i, dir)}
                          onRemove={() => removeImage(def.angle, url)}
                          onSetMain={onSetMain ? () => onSetMain(url) : undefined}
                        />
                      ))}
                      {!full && (
                        <button
                          type="button"
                          onClick={() => openPicker(def.angle)}
                          disabled={busy || uploadingAngle !== null}
                          className="group flex aspect-[4/3] w-[104px] shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] text-[color:var(--admin-text-muted)] transition-colors hover:border-[color:var(--admin-accent)]/60 hover:bg-[color:var(--admin-surface-2)] hover:text-[color:var(--admin-text-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy ? (
                            <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                              <span className="text-[0.625rem] font-medium">Ajouter</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between border-t border-[color:var(--admin-line)] pt-3">
        <p className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
          <span className="admin-tabular text-[color:var(--admin-text-soft)]">{totalPhotos}</span>
          <span className="ml-1">photo{totalPhotos > 1 ? "s" : ""} ·</span>
          <span className="admin-tabular ml-1 text-[color:var(--admin-text-soft)]">{coveredAngles}</span>
          <span className="ml-1">/ {SHOT_ANGLES.length} angles couverts</span>
        </p>
        {totalPhotos > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange([])}>
            Tout retirer
          </Button>
        )}
      </div>
    </div>
  );
}
