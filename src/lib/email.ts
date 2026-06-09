import { Resend } from "resend";

/**
 * Couche transport e-mail — unique point qui parle à Resend.
 *
 * Toute la configuration vient des variables d'environnement :
 *  - RESEND_API_KEY            : clé API Resend (console resend.com)
 *  - EMAIL_FROM                : expéditeur, ex. "Prestige Avenue <contact@prestige-avenue.fr>"
 *  - BOOKING_NOTIFICATION_EMAIL: destinataire des alertes (l'agence)
 *
 * Si la clé manque (typiquement en local), l'envoi est désactivé proprement :
 * `sendEmail` log un avertissement et renvoie `{ skipped: true }` au lieu de
 * planter. Le reste de l'application n'a donc jamais à se soucier de la config.
 */

const apiKey = process.env.RESEND_API_KEY;

/** Expéditeur par défaut. Doit être une adresse d'un domaine vérifié chez Resend. */
export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "Prestige Avenue <onboarding@resend.dev>";

/** Adresse de l'agence qui reçoit les notifications de réservation. */
export const BOOKING_NOTIFICATION_EMAIL = process.env.BOOKING_NOTIFICATION_EMAIL;

/** Client Resend mémoïsé — `null` tant que la clé API n'est pas configurée. */
const resend = apiKey ? new Resend(apiKey) : null;

/** Indique si l'envoi d'e-mail est opérationnel (clé API présente). */
export function isEmailConfigured(): boolean {
  return resend !== null;
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  /** Version texte (repli pour les clients sans HTML, meilleure délivrabilité). */
  text: string;
  /** Adresse de réponse, ex. l'e-mail du client pour répondre directement. */
  replyTo?: string;
}

export type SendEmailResult =
  | { skipped: true }
  | { skipped: false; id: string };

/**
 * Envoie un e-mail via Resend.
 *
 * - Si la config manque → log d'avertissement et `{ skipped: true }` (pas d'erreur).
 * - Si Resend renvoie une erreur → on `throw` : c'est au code appelant de
 *   décider quoi en faire (ici, le notifier de réservation l'absorbe).
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY absente — e-mail non envoyé (sujet : %s)",
      input.subject,
    );
    return { skipped: true };
  }

  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  });

  if (error) {
    throw new Error(`Échec de l'envoi e-mail (Resend) : ${error.message}`);
  }

  return { skipped: false, id: data?.id ?? "" };
}
