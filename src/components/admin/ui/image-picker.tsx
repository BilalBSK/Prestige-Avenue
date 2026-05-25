"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_SIZE_BYTES } from "@/lib/blob";
import { uploadImageToR2 } from "@/lib/upload-client";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { Button } from "./button";
import { toast } from "./toast";

const ALLOWED_MIMES: readonly string[] = ALLOWED_IMAGE_MIMES;

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
}

export function ImagePicker({ value, onChange, folder }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const csrfToken = useCsrfToken();

  async function handleFile(file: File) {
    if (!ALLOWED_MIMES.includes(file.type)) {
      toast.error("Format non supporté (JPEG, PNG, WebP, AVIF).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Fichier trop volumineux (max 5 Mo).");
      return;
    }
    if (!csrfToken) {
      toast.error("Session non prête, réessayez dans un instant.");
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await uploadImageToR2({ file, folder, csrfToken });
      onChange(publicUrl);
      toast.success("Image importée.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {value ? (
        <div className="group relative h-48 w-full overflow-hidden rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)]">
          <Image src={value} alt="Aperçu" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              loading={uploading}
              onClick={() => inputRef.current?.click()}
            >
              Remplacer
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => onChange("")}
            >
              Retirer
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="group flex h-48 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] transition-colors hover:border-[color:var(--admin-accent)]/60 hover:bg-[color:var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--admin-surface-2)] text-[color:var(--admin-text-muted)] transition-colors group-hover:bg-[color:var(--admin-accent-dim)] group-hover:text-[color:var(--admin-accent)]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
              {uploading ? "Transfert en cours…" : "Importer une image"}
            </p>
            <p className="mt-0.5 text-[0.75rem] text-[color:var(--admin-text-muted)]">
              JPEG, PNG, WebP, AVIF — max 5 Mo
            </p>
          </div>
        </button>
      )}
    </div>
  );
}
