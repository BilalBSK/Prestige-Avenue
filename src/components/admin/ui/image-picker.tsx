"use client";

import { upload } from "@vercel/blob/client";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "./button";
import { toast } from "./toast";

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
}

export function ImagePicker({ value, onChange, folder }: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Seules les images sont acceptées.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
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
        <div className="relative h-48 w-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <Image src={value} alt="Preview" fill className="object-cover" unoptimized />
          <div className="absolute bottom-2 right-2 flex gap-1">
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
          className="flex h-48 w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-950 text-sm text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
        >
          {uploading ? "Upload en cours..." : "Cliquer pour importer une image"}
        </button>
      )}
    </div>
  );
}
