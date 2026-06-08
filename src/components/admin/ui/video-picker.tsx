"use client";

import { useRef, useState } from "react";
import {
  ALLOWED_VIDEO_MIMES,
  MAX_VIDEO_SIZE_BYTES,
} from "@/lib/blob";
import { uploadVideoToR2 } from "@/lib/upload-client";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { Button } from "./button";
import { toast } from "./toast";

const ALLOWED_MIMES: readonly string[] = ALLOWED_VIDEO_MIMES;
const MAX_MB = Math.round(MAX_VIDEO_SIZE_BYTES / (1024 * 1024));

interface VideoPickerProps {
  /** URL R2 de la vidéo, ou null si aucune. */
  value: string | null;
  onChange: (url: string | null) => void;
  folder: string;
}

export function VideoPicker({ value, onChange, folder }: VideoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const csrfToken = useCsrfToken();

  async function handleFile(file: File) {
    if (!ALLOWED_MIMES.includes(file.type)) {
      toast.error("Format non supporté (MP4, WebM, MOV).");
      return;
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      toast.error(`Vidéo trop volumineuse (max ${MAX_MB} Mo).`);
      return;
    }
    if (!csrfToken) {
      toast.error("Session non prête, réessayez dans un instant.");
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const publicUrl = await uploadVideoToR2({
        file,
        folder,
        csrfToken,
        onProgress: setProgress,
      });
      onChange(publicUrl);
      toast.success("Vidéo importée.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload.";
      toast.error(msg);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  const pct = Math.round(progress * 100);

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />

      {uploading ? (
        <div className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] px-6">
          <p className="text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
            Transfert en cours… {pct}%
          </p>
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[color:var(--admin-surface-2)]">
            <div
              className="h-full rounded-full bg-[color:var(--admin-accent)] transition-[width] duration-200"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
            Ne fermez pas cette page jusqu&apos;à la fin du transfert.
          </p>
        </div>
      ) : value ? (
        <div className="group relative w-full overflow-hidden rounded-lg border border-[color:var(--admin-line-strong)] bg-black">
          <video
            src={value}
            controls
            playsInline
            preload="metadata"
            className="h-48 w-full bg-black object-contain"
          />
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              Remplacer
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onChange(null)}
            >
              Retirer
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] transition-colors hover:border-[color:var(--admin-accent)]/60 hover:bg-[color:var(--admin-surface-2)]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--admin-surface-2)] text-[color:var(--admin-text-muted)] transition-colors group-hover:bg-[color:var(--admin-accent-dim)] group-hover:text-[color:var(--admin-accent)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h6A1.5 1.5 0 0 1 12 5.5v7A1.5 1.5 0 0 1 10.5 14h-6A1.5 1.5 0 0 1 3 12.5v-7Z" stroke="currentColor" strokeWidth="1.4" />
              <path d="M12 8l3-1.8v5.6L12 10" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
              Importer une vidéo
            </p>
            <p className="mt-0.5 text-[0.75rem] text-[color:var(--admin-text-muted)]">
              MP4, WebM, MOV — max {MAX_MB} Mo
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
