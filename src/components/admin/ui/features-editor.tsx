"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "./button";
import { Field } from "./field";
import {
  FeatureImagePicker,
  type FeatureLibraryImage,
} from "./feature-image-picker";
import { Input } from "./input";
import { Textarea } from "./textarea";

export interface FeatureItem {
  title: string;
  body: string;
  /** Image épinglée pour ce paragraphe ; null/absent = appariement automatique. */
  image?: string | null;
}

interface FeaturesEditorProps {
  value: FeatureItem[];
  onChange: (items: FeatureItem[]) => void;
  maxItems?: number;
  folder: string;
  /** Photos du véhicule proposées au choix (studio, couverture, sélection). */
  library: FeatureLibraryImage[];
  /**
   * URLs des prises de vue du studio, dans l'ordre — sert à prévisualiser
   * l'image utilisée en mode automatique (même règle que la fiche publique).
   */
  autoSequence: string[];
  /** Repli ultime si le véhicule n'a aucune prise de vue. */
  autoFallback: string | null;
}

export function FeaturesEditor({
  value,
  onChange,
  maxItems = 10,
  folder,
  library,
  autoSequence,
  autoFallback,
}: FeaturesEditorProps) {
  // Index de l'équipement dont le sélecteur d'image est ouvert (null = fermé).
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  function update(index: number, patch: Partial<FeatureItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function add() {
    if (value.length >= maxItems) return;
    onChange([...value, { title: "", body: "", image: null }]);
  }

  // Image utilisée en mode automatique pour un paragraphe donné — reproduit la
  // règle de la fiche : cycle sur les prises de vue, repli sur l'image principale.
  function autoImageFor(index: number): string | null {
    if (autoSequence.length > 0) return autoSequence[index % autoSequence.length];
    return autoFallback;
  }

  const active = pickerIndex !== null ? value[pickerIndex] : null;

  return (
    <div className="space-y-3">
      {value.map((item, i) => {
        const pinned = item.image?.trim() ? item.image.trim() : null;
        const autoImg = autoImageFor(i);
        // Vignette affichée : l'image épinglée, sinon l'aperçu du mode auto.
        const preview = pinned ?? autoImg;
        return (
          <div
            key={i}
            className="rounded-lg border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[0.75rem] font-medium text-[color:var(--admin-text-soft)]">
                <span className="admin-tabular flex h-5 min-w-5 items-center justify-center rounded bg-[color:var(--admin-bg-elev)] px-1 text-[0.6875rem] text-[color:var(--admin-text-muted)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                Équipement
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-danger-dim)] hover:text-[color:var(--admin-danger-soft)]"
                aria-label="Supprimer"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 3.5H11M5.5 3.5V2.5H8.5V3.5M4.5 3.5L5 11H9L9.5 3.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Image appariée à gauche · champs texte à droite. Sur mobile, image
                au-dessus. Le lien visuel image↔texte est ainsi explicite. */}
            <div className="grid gap-4 sm:grid-cols-[168px_1fr]">
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setPickerIndex(i)}
                  className="group relative block aspect-[4/3] w-full overflow-hidden rounded-md border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] transition-colors hover:border-[color:var(--admin-accent)]/60"
                  aria-label={`Choisir l'image de l'équipement ${i + 1}`}
                >
                  {preview ? (
                    <>
                      <Image
                        src={preview}
                        alt=""
                        fill
                        sizes="168px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                    </>
                  ) : (
                    <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-[color:var(--admin-text-muted)]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M3 16l5-5 4 4 3-3 6 6M3 5h18v14H3V5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-[0.625rem]">Aucune photo</span>
                    </span>
                  )}

                  {/* Badge état : épinglée (accent) vs automatique (neutre). */}
                  <span
                    className={`pointer-events-none absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.625rem] font-medium ${
                      pinned
                        ? "bg-[color:var(--admin-accent)] text-black"
                        : "bg-black/70 text-white"
                    }`}
                  >
                    {pinned ? (
                      <>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
                          <path d="M6 1.2l1.4 2.9 3.1.3-2.3 2.1.7 3L6 8.1 3.1 9.5l.7-3L1.5 4.4l3.1-.3L6 1.2Z" fill="currentColor" />
                        </svg>
                        Épinglée
                      </>
                    ) : (
                      <>
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden>
                          <path d="M2 9l3-3 2 2 3-3M2 2.5h8v7H2v-7Z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Auto
                      </>
                    )}
                  </span>

                  {/* Invite au survol */}
                  <span className="pointer-events-none absolute inset-x-1.5 bottom-1.5 flex items-center justify-center gap-1 rounded bg-black/65 py-1 text-[0.625rem] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 4.5l4-2.5 4 2.5M2 4.5v3.5l4 2 4-2V4.5M2 4.5l4 2.5 4-2.5" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
                    </svg>
                    Changer l&apos;image
                  </span>
                </button>

                {pinned && (
                  <button
                    type="button"
                    onClick={() => update(i, { image: null })}
                    className="flex w-full items-center justify-center gap-1 text-[0.6875rem] text-[color:var(--admin-text-muted)] transition-colors hover:text-[color:var(--admin-accent)]"
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M3 6h6M6 3v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" transform="rotate(45 6 6)" />
                    </svg>
                    Revenir en automatique
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <Field label="Intitulé">
                  <Input
                    value={item.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                    placeholder="Sécurité augmentée"
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    rows={3}
                    value={item.body}
                    onChange={(e) => update(i, { body: e.target.value })}
                    placeholder="Expliquez cet équipement en 1-2 phrases."
                  />
                </Field>
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between">
        <p className="text-[0.75rem] text-[color:var(--admin-text-muted)]">
          <span className="admin-tabular text-[color:var(--admin-text-soft)]">{value.length}</span>
          <span className="mx-1">/</span>
          <span className="admin-tabular">{maxItems}</span>
        </p>
        {value.length < maxItems && (
          <Button type="button" variant="secondary" size="sm" onClick={add}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 2.5V9.5M2.5 6H9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Ajouter
          </Button>
        )}
      </div>

      {active && pickerIndex !== null && (
        <FeatureImagePicker
          open
          onClose={() => setPickerIndex(null)}
          index={pickerIndex + 1}
          featureTitle={active.title}
          current={active.image?.trim() ? active.image.trim() : null}
          autoPreview={autoImageFor(pickerIndex)}
          library={library}
          folder={folder}
          onSelect={(url) => update(pickerIndex, { image: url })}
        />
      )}
    </div>
  );
}
