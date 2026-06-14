import { GalleryMediaType, GalleryRatio } from "@prisma/client";
import { z } from "zod";

/**
 * Schéma d'une tuile de la galerie d'accueil, côté admin.
 *
 * Règle métier clé : une tuile VIDEO DOIT porter un `poster` (image affichée
 * avant lecture et sous prefers-reduced-motion). On l'exprime via un refine
 * plutôt qu'un simple `optional`, pour que le formulaire échoue proprement
 * plutôt que de laisser passer une vidéo sans image de repli.
 */
export const galleryItemFormSchema = z
  .object({
    mediaType: z.enum(GalleryMediaType),
    src: z.url("Média manquant ou URL invalide."),
    poster: z.url("Poster invalide.").nullable(),
    alt: z.string().min(3, "Décrivez le visuel (texte alternatif).").max(160),
    ratio: z.enum(GalleryRatio),
    isPublished: z.boolean(),
  })
  .refine((v) => v.mediaType !== "VIDEO" || Boolean(v.poster), {
    message: "Une vidéo nécessite une image de couverture (poster).",
    path: ["poster"],
  });

export type GalleryItemInput = z.infer<typeof galleryItemFormSchema>;
