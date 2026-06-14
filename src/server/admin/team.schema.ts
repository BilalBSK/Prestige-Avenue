import { z } from "zod";

/**
 * Longueur minimale du mot de passe d'un compte administrateur. Volontairement
 * plus stricte que le minimum du formulaire de connexion (8) : un compte admin
 * est privilégié, il mérite un secret plus solide.
 */
export const ADMIN_PASSWORD_MIN_LENGTH = 12;

/** Création d'un administrateur depuis la page « Équipe ». */
export const createAdminSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(80, "80 caractères max."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("E-mail invalide"))
    .pipe(z.string().max(160, "160 caractères max.")),
  password: z
    .string()
    .min(ADMIN_PASSWORD_MIN_LENGTH, `${ADMIN_PASSWORD_MIN_LENGTH} caractères minimum.`)
    .max(128, "128 caractères max."),
});

export type CreateAdminInput = z.infer<typeof createAdminSchema>;
