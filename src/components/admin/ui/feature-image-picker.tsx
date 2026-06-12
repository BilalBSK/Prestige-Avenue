"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { ALLOWED_IMAGE_MIMES, MAX_IMAGE_SIZE_BYTES } from "@/lib/blob";
import { uploadImageToR2 } from "@/lib/upload-client";
import { useCsrfToken } from "@/hooks/use-csrf-token";
import { Button } from "./button";
import { toast } from "./toast";

const ALLOWED_MIMES: readonly string[] = ALLOWED_IMAGE_MIMES;

/** Une image piochable dans la bibliothèque du véhicule. */
export interface FeatureLibraryImage {
  url: string;
  /** Libellé court (ex. « Trois-quarts avant », « Image principale »). */
  label: string;
  /** Regroupement affiché (ex. « Studio · Extérieur », « Couverture »). */
  group: string;
}

interface FeatureImagePickerProps {
  open: boolean;
  onClose: () => void;
  /** Numéro de l'équipement (1-based) — pour le titre. */
  index: number;
  /** Intitulé de l'équipement — pour rappeler à quel texte l'image se rattache. */
  featureTitle: string;
  /** Image actuellement épinglée (null = mode automatique). */
  current: string | null;
  /** Image qui serait utilisée en mode automatique (aperçu). */
  autoPreview: string | null;
  /** Photos existantes du véhicule, proposées au choix. */
  library: FeatureLibraryImage[];
  folder: string;
  /** `url` pour épingler, `null` pour rétablir le mode automatique. */
  onSelect: (url: string | null) => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Sélecteur d'image pour un paragraphe « Sous le capot ».
 *
 * Trois manières de choisir, sans jamais réimporter inutilement :
 *   1. Automatique — la fiche réutilise une prise de vue du studio (défaut).
 *   2. Piocher dans les photos déjà rattachées au véhicule (studio, couverture…).
 *   3. Importer une nouvelle image dédiée.
 *
 * Rendu en portail sur <body> (échappe à l'overflow du formulaire), focus piégé,
 * fermeture sur Échap / clic sur le fond — mêmes conventions que Drawer.
 */
export function FeatureImagePicker({
  open,
  onClose,
  index,
  featureTitle,
  current,
  autoPreview,
  library,
  folder,
  onSelect,
}: FeatureImagePickerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const csrfToken = useCsrfToken();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      const node = panelRef.current;
      if (!node) return;
      (node.querySelector<HTMLElement>(FOCUSABLE) ?? node).focus();
    }, 30);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      lastActiveRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

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
      toast.success("Image importée.");
      onSelect(publicUrl);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur d'upload.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  function choose(url: string | null) {
    onSelect(url);
    onClose();
  }

  if (!open || !mounted) return null;

  const isAuto = current === null;

  return createPortal(
    <div
      className="admin-theme fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Image de l'équipement ${index}`}
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="admin-fade-in relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] shadow-[0_28px_64px_-16px_rgba(0,0,0,0.75)] outline-none"
      >
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

        {/* En-tête */}
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[color:var(--admin-line)] px-5 py-4">
          <div className="min-w-0">
            <p className="admin-mono mb-0.5 text-[0.6875rem] text-[color:var(--admin-text-muted)]">
              Équipement {index} · Image illustrative
            </p>
            <h2 className="truncate text-[0.9375rem] font-semibold text-[color:var(--admin-text)]">
              {featureTitle.trim() || "Sans titre"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Modes : automatique + import */}
          <div className="grid grid-cols-2 gap-3">
            {/* Automatique */}
            <button
              type="button"
              onClick={() => choose(null)}
              aria-pressed={isAuto}
              className={`group relative flex flex-col overflow-hidden rounded-lg border text-left transition-colors ${
                isAuto
                  ? "border-[color:var(--admin-accent)] ring-1 ring-[color:var(--admin-accent)]/40"
                  : "border-[color:var(--admin-line-strong)] hover:border-[color:var(--admin-accent)]/50"
              }`}
            >
              <div className="relative aspect-[16/9] w-full bg-[color:var(--admin-surface)]">
                {autoPreview ? (
                  <Image src={autoPreview} alt="" fill sizes="240px" className="object-cover opacity-90" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-[color:var(--admin-text-muted)]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M3 16l5-5 4 4 3-3 6 6M3 5h18v14H3V5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
                {isAuto && <SelectedTick />}
              </div>
              <div className="px-3 py-2">
                <p className="flex items-center gap-1.5 text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden className="text-[color:var(--admin-accent)]">
                    <path d="M7 1.5l1.3 3.2 3.2.3-2.4 2.1.7 3.1L7 9.7l-2.8 1.6.7-3.1L2.5 5l3.2-.3L7 1.5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
                  </svg>
                  Automatique
                </p>
                <p className="mt-0.5 text-[0.6875rem] leading-snug text-[color:var(--admin-text-muted)]">
                  Une vue du studio, choisie pour vous.
                </p>
              </div>
            </button>

            {/* Importer */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] px-3 py-4 text-center transition-colors hover:border-[color:var(--admin-accent)]/60 hover:bg-[color:var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--admin-surface-2)] text-[color:var(--admin-text-muted)] transition-colors group-hover:bg-[color:var(--admin-accent-dim)] group-hover:text-[color:var(--admin-accent)]">
                {uploading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border border-current border-t-transparent" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                    <path d="M9 12V3M9 3L5.5 6.5M9 3l3.5 3.5M3 13.5h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
                  {uploading ? "Transfert…" : "Importer une image"}
                </p>
                <p className="mt-0.5 text-[0.6875rem] text-[color:var(--admin-text-muted)]">
                  JPEG, PNG, WebP — max 5 Mo
                </p>
              </div>
            </button>
          </div>

          {/* Bibliothèque du véhicule */}
          {library.length > 0 && (
            <div className="mt-5">
              <div className="mb-2.5 flex items-center gap-3">
                <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--admin-text-soft)]">
                  Photos du véhicule
                </h3>
                <span className="h-px flex-1 bg-[color:var(--admin-line)]" />
                <span className="admin-tabular text-[0.6875rem] text-[color:var(--admin-text-muted)]">
                  {library.length}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {library.map((img) => {
                  const selected = img.url === current;
                  return (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => choose(img.url)}
                      aria-pressed={selected}
                      title={`${img.group} — ${img.label}`}
                      className={`group relative flex flex-col overflow-hidden rounded-lg border text-left transition-colors ${
                        selected
                          ? "border-[color:var(--admin-accent)] ring-1 ring-[color:var(--admin-accent)]/40"
                          : "border-[color:var(--admin-line-strong)] hover:border-[color:var(--admin-accent)]/50"
                      }`}
                    >
                      <div className="relative aspect-[4/3] w-full bg-[color:var(--admin-surface)]">
                        <Image
                          src={img.url}
                          alt={img.label}
                          fill
                          sizes="200px"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                        {selected && <SelectedTick />}
                      </div>
                      <div className="px-2.5 py-1.5">
                        <p className="truncate text-[0.75rem] font-medium text-[color:var(--admin-text)]">
                          {img.label}
                        </p>
                        <p className="truncate text-[0.625rem] uppercase tracking-[0.08em] text-[color:var(--admin-text-muted)]">
                          {img.group}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] px-5 py-3">
          <p className="text-[0.6875rem] text-[color:var(--admin-text-muted)]">
            L&apos;image illustre ce paragraphe sur la fiche publique.
          </p>
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Fermer
          </Button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

/** Pastille de sélection (coin haut-droit). */
function SelectedTick() {
  return (
    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--admin-accent)] text-black shadow">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
        <path d="M2.5 6.2l2.2 2.3L9.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
