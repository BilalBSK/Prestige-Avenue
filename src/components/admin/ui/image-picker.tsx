"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_SIZE_BYTES } from "@/lib/blob";
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

  async function handleFile(file: File) {
    if (!ALLOWED_MIMES.includes(file.type)) {
      toast.error("Format non supporté (JPEG, PNG, WebP, AVIF).");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Fichier trop volumineux (max 5 Mo).");
      return;
    }

    setUploading(true);
    try {
      const blob = await upload(`${folder}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      onChange(blob.url);
      toast.success("Image importée.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
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
        <div className="group relative h-56 w-full overflow-hidden border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]">
          <Image src={value} alt="Aperçu" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 right-4 flex gap-2">
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
          className="group relative flex h-56 w-full flex-col items-center justify-center gap-2 border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)]/40 transition-all duration-500 hover:border-[color:var(--admin-accent)] hover:bg-[color:var(--admin-bg-elev)]/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span
            aria-hidden
            className="admin-mono text-[0.58rem] uppercase tracking-[0.4em] text-[color:var(--admin-text-muted)] transition-colors duration-500 group-hover:text-[color:var(--admin-accent)]"
          >
            {uploading ? "Transfert en cours" : "Importer une image"}
          </span>
          <span className="admin-serif text-[0.9rem] italic text-[color:var(--admin-text-muted)]/70">
            {uploading ? "·" : "JPEG · PNG · WebP · AVIF — max 5 Mo"}
          </span>
        </button>
      )}
    </div>
  );
}
