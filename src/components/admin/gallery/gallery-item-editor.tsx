"use client";

import { useState, useTransition } from "react";
import type { GalleryMediaType, GalleryRatio } from "@prisma/client";
import { GALLERY_RATIO_OPTIONS, GALLERY_RATIOS } from "@/lib/home/gallery-items";
import { Drawer } from "@/components/admin/ui/drawer";
import { Field } from "@/components/admin/ui/field";
import { Input } from "@/components/admin/ui/input";
import { Switch } from "@/components/admin/ui/switch";
import { Button } from "@/components/admin/ui/button";
import { ImagePicker } from "@/components/admin/ui/image-picker";
import { VideoPicker } from "@/components/admin/ui/video-picker";
import { toast } from "@/components/admin/ui/toast";
import {
  createGalleryItem,
  updateGalleryItem,
} from "@/server/admin/home-gallery.actions";
import { GalleryTilePreview } from "./gallery-tile-preview";
import type { GalleryItemRow } from "./gallery-manager";

const UPLOAD_FOLDER = "gallery";

interface GalleryItemEditorProps {
  /** Tuile à éditer, ou `null` pour une création. */
  item: GalleryItemRow | null;
  onClose: () => void;
}

/**
 * Tiroir d'ajout / d'édition d'une tuile de galerie.
 *
 * Soin « frontend-design » : à droite du formulaire, un aperçu live rend la
 * tuile exactement comme sur l'accueil (vrai ratio, voile, liseré or au survol),
 * mis à jour à chaque frappe / upload / changement de format. L'admin compose
 * en voyant le résultat final, sans aller-retour vers la home.
 */
export function GalleryItemEditor({ item, onClose }: GalleryItemEditorProps) {
  const isEdit = Boolean(item);
  const [mediaType, setMediaType] = useState<GalleryMediaType>(item?.mediaType ?? "IMAGE");
  const [src, setSrc] = useState<string>(item?.src ?? "");
  const [poster, setPoster] = useState<string | null>(item?.poster ?? null);
  const [alt, setAlt] = useState<string>(item?.alt ?? "");
  const [ratio, setRatio] = useState<GalleryRatio>(item?.ratio ?? "LANDSCAPE");
  const [isPublished, setIsPublished] = useState<boolean>(item?.isPublished ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    setError(null);

    // Validations métier, miroir du schéma zod — feedback immédiat sans aller-retour.
    if (!src) {
      setError(mediaType === "VIDEO" ? "Importez une vidéo." : "Importez une image.");
      return;
    }
    if (mediaType === "VIDEO" && !poster) {
      setError("Une vidéo nécessite une image de couverture (poster).");
      return;
    }
    if (alt.trim().length < 3) {
      setError("Décrivez le visuel (texte alternatif) — au moins 3 caractères.");
      return;
    }

    const input = {
      mediaType,
      src,
      poster: mediaType === "VIDEO" ? poster : null,
      alt: alt.trim(),
      ratio,
      isPublished,
    };

    startTransition(async () => {
      try {
        if (item) {
          await updateGalleryItem(item.id, input);
          toast.success("Tuile mise à jour.");
        } else {
          await createGalleryItem(input);
          toast.success("Tuile ajoutée à la galerie.");
        }
        onClose();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Erreur à l'enregistrement.";
        setError(msg);
        toast.error(msg);
      }
    });
  }

  return (
    <Drawer
      open
      onClose={onClose}
      eyebrow={isEdit ? "Galerie · édition" : "Galerie · nouvelle tuile"}
      title={isEdit ? "Modifier la tuile" : "Ajouter un visuel"}
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button type="button" variant="primary" size="md" onClick={handleSave} loading={pending}>
            {isEdit ? "Enregistrer" : "Ajouter"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* --- Aperçu live : la tuile telle qu'elle s'affichera sur l'accueil --- */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
              Aperçu
            </span>
            <span className="admin-mono text-[0.6875rem] text-[color:var(--admin-text-muted)]">
              {GALLERY_RATIOS[ratio].w} / {GALLERY_RATIOS[ratio].h} · survolez
            </span>
          </div>
          <div className="mx-auto max-w-[240px]">
            <GalleryTilePreview
              mediaType={mediaType}
              src={src || null}
              poster={poster}
              alt={alt || "Aperçu de la tuile"}
              ratio={ratio}
              live
              sizes="240px"
            />
          </div>
        </div>

        {/* --- Type de média : segmented control --- */}
        <Field label="Type de média">
          <div className="grid grid-cols-2 gap-1 rounded-md border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] p-1">
            {(
              [
                { value: "IMAGE", label: "Photo" },
                { value: "VIDEO", label: "Vidéo" },
              ] as const
            ).map((opt) => {
              const active = mediaType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMediaType(opt.value)}
                  aria-pressed={active}
                  className={`rounded-[5px] px-3 py-1.5 text-[0.8125rem] font-medium transition-colors ${
                    active
                      ? "bg-[color:var(--admin-accent)] text-black"
                      : "text-[color:var(--admin-text-soft)] hover:bg-[color:var(--admin-surface-2)] hover:text-[color:var(--admin-text)]"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </Field>

        {/* --- Upload du média principal --- */}
        <Field
          label={mediaType === "VIDEO" ? "Vidéo" : "Image"}
          required
          hint={
            mediaType === "VIDEO"
              ? "Clip court, muet et en boucle — MP4, WebM, MOV (max 50 Mo)."
              : "JPEG, PNG, WebP, AVIF — max 5 Mo."
          }
        >
          {mediaType === "VIDEO" ? (
            <VideoPicker
              value={src || null}
              onChange={(url) => setSrc(url ?? "")}
              folder={UPLOAD_FOLDER}
              scope="home"
            />
          ) : (
            <ImagePicker
              value={src}
              onChange={(url) => setSrc(url)}
              folder={UPLOAD_FOLDER}
              scope="home"
            />
          )}
        </Field>

        {/* --- Poster (vidéo uniquement) --- */}
        {mediaType === "VIDEO" && (
          <Field
            label="Image de couverture (poster)"
            required
            hint="Affichée avant lecture et si l'utilisateur a réduit les animations."
          >
            <ImagePicker
              value={poster ?? ""}
              onChange={(url) => setPoster(url || null)}
              folder={UPLOAD_FOLDER}
              scope="home"
            />
          </Field>
        )}

        {/* --- Format / ratio : 3 boutons avec mini-aperçu du rapport --- */}
        <Field label="Format" hint="Rythme les colonnes de la galerie sur l'accueil.">
          <div className="grid grid-cols-3 gap-2">
            {GALLERY_RATIO_OPTIONS.map((opt) => {
              const active = ratio === opt.value;
              const dims = GALLERY_RATIOS[opt.value];
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRatio(opt.value)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-2 rounded-md border px-2 py-3 transition-colors ${
                    active
                      ? "border-[color:var(--admin-accent)] bg-[color:var(--admin-accent-dim)]"
                      : "border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] hover:border-[color:var(--admin-line-strong)] hover:bg-[color:var(--admin-surface-2)]"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`block w-7 rounded-[3px] ${
                      active
                        ? "bg-[color:var(--admin-accent)]"
                        : "bg-[color:var(--admin-line-strong)]"
                    }`}
                    style={{ aspectRatio: `${dims.w} / ${dims.h}` }}
                  />
                  <span
                    className={`text-[0.75rem] font-medium ${
                      active ? "text-[color:var(--admin-text)]" : "text-[color:var(--admin-text-soft)]"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        {/* --- Texte alternatif --- */}
        <Field
          label="Texte alternatif"
          htmlFor="gallery-alt"
          required
          hint="Description du visuel pour l'accessibilité et le référencement."
        >
          <Input
            id="gallery-alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Ex. Coupé sportif de profil, carrosserie sombre"
            maxLength={160}
          />
        </Field>

        {/* --- Publication --- */}
        <div className="flex items-center justify-between rounded-md border border-[color:var(--admin-line-strong)] bg-[color:var(--admin-surface)] px-3.5 py-3">
          <div>
            <div className="text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
              Publiée
            </div>
            <div className="mt-0.5 text-[0.75rem] text-[color:var(--admin-text-muted)]">
              Visible dans la galerie de l&apos;accueil.
            </div>
          </div>
          <Switch
            checked={isPublished}
            onCheckedChange={setIsPublished}
            aria-label="Publier la tuile"
          />
        </div>

        {error && (
          <p className="rounded-md border border-[color:var(--admin-danger)]/40 bg-[color:var(--admin-danger-dim)] px-3 py-2 text-[0.8125rem] text-[color:var(--admin-danger-soft)]">
            {error}
          </p>
        )}
      </div>
    </Drawer>
  );
}
