import { z } from "zod";

/** Une photo de collaboration, avec ses dimensions naturelles (px). */
export const collaborationPhotoSchema = z.object({
  url: z.url(),
  width: z.number().int().positive().max(20000),
  height: z.number().int().positive().max(20000),
});

export type CollaborationPhoto = z.infer<typeof collaborationPhotoSchema>;

export const collaborationFormSchema = z.object({
  partnerName: z.string().min(2, "Nom trop court").max(80),
  // Lien optionnel vers le profil/site du partenaire. Chaîne vide → null.
  partnerUrl: z.url("URL invalide").max(300).nullable(),
  photos: z.array(collaborationPhotoSchema).min(1, "Ajoutez au moins une photo").max(20),
  isPublished: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

export type CollaborationInput = z.infer<typeof collaborationFormSchema>;
