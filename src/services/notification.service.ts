import { calculateRentalDays } from "@/lib/booking";
import { BOOKING_NOTIFICATION_EMAIL, sendEmail, type SendEmailResult } from "@/lib/email";

/**
 * Notifications e-mail liées aux réservations.
 *
 * Règle d'or : ces fonctions **n'échouent jamais** vis-à-vis de l'appelant.
 * Une réservation ne doit pas être perdue ni une transition bloquée parce qu'un
 * e-mail n'est pas parti. En cas de problème (config absente, Resend KO…) on
 * log et on continue.
 */

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

function formatEUR(amount: number): string {
  return eurFormatter.format(amount);
}

function pluralDays(rentalDays: number): string {
  return `${rentalDays} jour${rentalDays > 1 ? "s" : ""}`;
}

/** Référence courte et lisible, identique à celle affichée dans l'admin. */
function shortReference(bookingId: string): string {
  return `#${bookingId.slice(-8).toUpperCase()}`;
}

/** Prénom seul, pour une salutation chaleureuse ("Bonjour Marie,"). */
function firstNameOf(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName.trim();
}

/**
 * Trace l'issue d'un envoi pour laisser une preuve dans les logs de l'hébergeur.
 * - envoyé  → `info` avec l'id Resend (corrélable au dashboard Resend → Logs) ;
 * - skipped → config e-mail absente ; `error` en prod (anomalie), `warn` sinon.
 * Sert à diagnostiquer sans deviner : on sait si un e-mail est réellement parti.
 */
function logSendOutcome(
  kind: string,
  bookingId: string,
  result: SendEmailResult,
): void {
  const ref = shortReference(bookingId);
  if (result.skipped) {
    const log = process.env.NODE_ENV === "production" ? console.error : console.warn;
    log("[notification] %s NON envoyé (%s) — envoi e-mail désactivé (config).", kind, ref);
  } else {
    console.info("[notification] %s envoyé (%s) — Resend id %s.", kind, ref, result.id);
  }
}

/** URL absolue vers la liste des réservations de l'admin. */
function adminBookingsUrl(): string | null {
  const base = process.env.NEXTAUTH_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/admin/bookings`;
}

// ─────────────────────────────────────────────────────────────────────────
//  Briques HTML partagées (tables inline pour la compatibilité clients mail)
// ─────────────────────────────────────────────────────────────────────────

/** Une ligne label / valeur dans une section. `valueHtml` est déjà rendu. */
function row(label: string, valueHtml: string): string {
  return `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #ececec;font:13px/1.4 Arial,sans-serif;color:#8a8a8a;width:38%;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="padding:11px 0;border-bottom:1px solid #ececec;font:600 15px/1.4 Arial,sans-serif;color:#1a1a1a;vertical-align:top;">${valueHtml}</td>
    </tr>`;
}

/** Une section titrée contenant un tableau de lignes label/valeur. */
function sectionBlock(label: string, rows: Array<[string, string]>): string {
  return `<tr><td style="padding:22px 28px 4px;">
    <p style="margin:0 0 4px;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a8a8a;">${escapeHtml(label)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rows.map(([l, v]) => row(l, v)).join("")}
    </table>
  </td></tr>`;
}

/** Bandeau d'accent (citation client, ou confirmation) avec liseré or. */
function calloutBlock(html: string): string {
  return `<tr><td style="padding:20px 28px 0;">
    <div style="padding:14px 16px;background:#faf7f0;border-left:3px solid #c9a24e;border-radius:4px;font:15px/1.6 Georgia,serif;color:#2a2a2a;">${html}</div>
  </td></tr>`;
}

/** Bouton d'action principal (fond sombre). */
function ctaBlock(href: string, label: string): string {
  return `<tr><td style="padding:28px;" align="center">
    <a href="${escapeAttr(href)}" style="display:inline-block;padding:13px 30px;background:#161616;color:#ffffff;font:600 14px/1 Arial,sans-serif;letter-spacing:.04em;text-decoration:none;border-radius:6px;">${escapeHtml(label)}</a>
  </td></tr>`;
}

/** Pied de page discret avec note explicative. */
function footerBlock(note: string): string {
  return `<tr><td style="padding:18px 28px;background:#faf9f6;border-top:1px solid #ececec;">
    <p style="margin:0;font:13px/1.6 Arial,sans-serif;color:#8a8a8a;">${escapeHtml(note)}</p>
  </td></tr>`;
}

/** Enveloppe complète : en-tête de marque + carte blanche + blocs fournis. */
function renderEmail(opts: {
  title: string;
  reference: string;
  intro?: string;
  blocks: string[];
}): string {
  const introBlock = opts.intro
    ? `<tr><td style="padding:24px 28px 0;">
         <p style="margin:0;font:16px/1.6 Georgia,serif;color:#2a2a2a;">${escapeHtml(opts.intro)}</p>
       </td></tr>`
    : "";

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0eee9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0eee9;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">

        <tr><td style="background:#161616;padding:26px 28px;">
          <p style="margin:0;font:600 12px/1 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#c9a24e;">Prestige Avenue</p>
          <h1 style="margin:8px 0 0;font:600 22px/1.3 Georgia,serif;color:#ffffff;">${escapeHtml(opts.title)}</h1>
          <p style="margin:6px 0 0;font:13px/1.4 Arial,sans-serif;color:#9a9a9a;">Référence ${escapeHtml(opts.reference)}</p>
        </td></tr>

        ${introBlock}
        ${opts.blocks.join("\n")}

      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ─────────────────────────────────────────────────────────────────────────
//  Agence — nouvelle demande de réservation
// ─────────────────────────────────────────────────────────────────────────

export interface NewBookingNotificationInput {
  bookingId: string;
  carBrand: string;
  carModel: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerMessage: string | null;
}

/**
 * Prévient l'agence qu'une nouvelle demande de réservation vient d'arriver.
 * Absorbe toute erreur — ne propage rien à l'appelant.
 */
export async function notifyNewBookingRequest(
  input: NewBookingNotificationInput,
): Promise<void> {
  try {
    if (!BOOKING_NOTIFICATION_EMAIL) {
      // Destinataire agence non configuré : aucune alerte ne peut partir. En prod
      // c'est une erreur de config (le patron ne reçoit rien), on la remonte en
      // `error` pour qu'elle soit visible dans les logs de l'hébergeur.
      const log = process.env.NODE_ENV === "production" ? console.error : console.warn;
      log(
        "[notification] BOOKING_NOTIFICATION_EMAIL absente — alerte agence NON envoyée (%s). " +
          "Renseigner BOOKING_NOTIFICATION_EMAIL en production.",
        shortReference(input.bookingId),
      );
      return;
    }

    const car = `${input.carBrand} ${input.carModel}`;
    const reference = shortReference(input.bookingId);
    const rentalDays = calculateRentalDays(input.startDate, input.endDate);

    const phoneHtml = input.customerPhone
      ? `<a href="tel:${escapeAttr(input.customerPhone)}" style="color:#1a1a1a;text-decoration:none;">${escapeHtml(input.customerPhone)}</a>`
      : '<span style="color:#b0b0b0;">non renseigné</span>';

    const blocks = [
      sectionBlock("Réservation", [
        ["Véhicule", escapeHtml(car)],
        ["Du", escapeHtml(formatDate(input.startDate))],
        ["Au", escapeHtml(formatDate(input.endDate))],
        ["Durée", pluralDays(rentalDays)],
        ["Prix estimé", `<span style="color:#c9a24e;">${escapeHtml(formatEUR(input.totalPrice))}</span>`],
      ]),
      sectionBlock("Client", [
        ["Nom", escapeHtml(input.customerName)],
        ["E-mail", `<a href="mailto:${escapeAttr(input.customerEmail)}" style="color:#1a1a1a;text-decoration:none;">${escapeHtml(input.customerEmail)}</a>`],
        ["Téléphone", phoneHtml],
      ]),
    ];

    if (input.customerMessage) {
      blocks.push(calloutBlock(`<em>« ${escapeHtml(input.customerMessage)} »</em>`));
    }

    const adminUrl = adminBookingsUrl();
    if (adminUrl) {
      blocks.push(ctaBlock(adminUrl, "Gérer la demande"));
    }

    blocks.push(
      footerBlock(
        "Aucune date n'est encore bloquée : la demande attend votre validation dans l'espace admin. C'est à l'agence de recontacter le client.",
      ),
    );

    const result = await sendEmail({
      to: BOOKING_NOTIFICATION_EMAIL,
      // Permet à l'agence de répondre directement au client depuis sa boîte.
      replyTo: input.customerEmail,
      subject: `Nouvelle demande — ${car} (${reference})`,
      text: buildNewRequestText({ ...input, car, reference, rentalDays }),
      html: renderEmail({
        title: "Nouvelle demande de réservation",
        reference,
        blocks,
      }),
    });
    logSendOutcome("alerte agence", input.bookingId, result);
  } catch (error) {
    console.error(
      "[notification] Échec de l'alerte de nouvelle demande (%s) :",
      shortReference(input.bookingId),
      error,
    );
  }
}

function buildNewRequestText(
  data: NewBookingNotificationInput & { car: string; reference: string; rentalDays: number },
): string {
  const lines = [
    `Nouvelle demande de réservation — ${data.reference}`,
    "",
    `Véhicule    : ${data.car}`,
    `Période     : du ${formatDate(data.startDate)} au ${formatDate(data.endDate)} (${pluralDays(data.rentalDays)})`,
    `Prix estimé : ${formatEUR(data.totalPrice)}`,
    "",
    "— Client —",
    `Nom         : ${data.customerName}`,
    `E-mail      : ${data.customerEmail}`,
    `Téléphone   : ${data.customerPhone ?? "non renseigné"}`,
  ];

  if (data.customerMessage) {
    lines.push("", "— Message du client —", data.customerMessage);
  }

  const url = adminBookingsUrl();
  if (url) {
    lines.push("", `Gérer la demande : ${url}`);
  }

  lines.push(
    "",
    "Aucune date n'est encore bloquée : la demande attend votre validation dans l'admin.",
  );

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────
//  Client — réservation confirmée par l'agence
// ─────────────────────────────────────────────────────────────────────────

export interface BookingConfirmedNotificationInput {
  bookingId: string;
  carBrand: string;
  carModel: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  customerName: string;
  customerEmail: string | null;
}

/**
 * Informe le client que sa réservation vient d'être confirmée par l'agence.
 * Déclenché sur la transition PENDING_REVIEW → CONFIRMED.
 * Absorbe toute erreur — ne bloque jamais la transition.
 */
export async function notifyBookingConfirmed(
  input: BookingConfirmedNotificationInput,
): Promise<void> {
  try {
    if (!input.customerEmail) {
      console.warn(
        "[notification] E-mail client absent — confirmation non envoyée (%s).",
        shortReference(input.bookingId),
      );
      return;
    }

    const car = `${input.carBrand} ${input.carModel}`;
    const reference = shortReference(input.bookingId);
    const rentalDays = calculateRentalDays(input.startDate, input.endDate);

    const blocks = [
      calloutBlock(
        `<strong style="color:#1a1a1a;">Votre réservation est confirmée.</strong><br>Les dates sont désormais bloquées à votre nom.`,
      ),
      sectionBlock("Votre réservation", [
        ["Véhicule", escapeHtml(car)],
        ["Du", escapeHtml(formatDate(input.startDate))],
        ["Au", escapeHtml(formatDate(input.endDate))],
        ["Durée", pluralDays(rentalDays)],
        ["Montant estimé", `<span style="color:#c9a24e;">${escapeHtml(formatEUR(input.totalPrice))}</span>`],
      ]),
      footerBlock(
        "Aucun paiement en ligne : le règlement s'effectue sur place lors de la remise des clés. Notre équipe vous recontactera pour organiser la prise en charge. Pour toute question, répondez simplement à cet e-mail.",
      ),
    ];

    const result = await sendEmail({
      to: input.customerEmail,
      // Les réponses du client arrivent dans la boîte de l'agence.
      ...(BOOKING_NOTIFICATION_EMAIL ? { replyTo: BOOKING_NOTIFICATION_EMAIL } : {}),
      subject: `Votre réservation est confirmée — ${car}`,
      text: buildConfirmedText({ ...input, car, reference, rentalDays }),
      html: renderEmail({
        title: "Réservation confirmée",
        reference,
        intro: `Bonjour ${firstNameOf(input.customerName)}, nous avons le plaisir de vous confirmer votre réservation chez Prestige Avenue.`,
        blocks,
      }),
    });
    logSendOutcome("confirmation client", input.bookingId, result);
  } catch (error) {
    console.error(
      "[notification] Échec de l'e-mail de confirmation client (%s) :",
      shortReference(input.bookingId),
      error,
    );
  }
}

function buildConfirmedText(
  data: BookingConfirmedNotificationInput & { car: string; reference: string; rentalDays: number },
): string {
  return [
    `Bonjour ${firstNameOf(data.customerName)},`,
    "",
    "Nous avons le plaisir de vous confirmer votre réservation chez Prestige Avenue.",
    "Les dates sont désormais bloquées à votre nom.",
    "",
    `Référence      : ${data.reference}`,
    `Véhicule       : ${data.car}`,
    `Du             : ${formatDate(data.startDate)}`,
    `Au             : ${formatDate(data.endDate)}`,
    `Durée          : ${pluralDays(data.rentalDays)}`,
    `Montant estimé : ${formatEUR(data.totalPrice)}`,
    "",
    "Aucun paiement en ligne : le règlement s'effectue sur place lors de la remise des clés.",
    "Notre équipe vous recontactera pour organiser la prise en charge.",
    "Pour toute question, répondez simplement à cet e-mail.",
    "",
    "Prestige Avenue",
  ].join("\n");
}

// ─────────────────────────────────────────────────────────────────────────
//  Client — demande déclinée par l'agence
// ─────────────────────────────────────────────────────────────────────────

export interface BookingDeclinedNotificationInput {
  bookingId: string;
  carBrand: string;
  carModel: string;
  startDate: Date;
  endDate: Date;
  customerName: string;
  customerEmail: string | null;
  declineReason: string | null;
}

/**
 * Informe le client que sa demande n'a pas pu être retenue.
 * Déclenché sur la transition PENDING_REVIEW → DECLINED.
 * Absorbe toute erreur — ne bloque jamais la transition.
 */
export async function notifyBookingDeclined(
  input: BookingDeclinedNotificationInput,
): Promise<void> {
  try {
    if (!input.customerEmail) {
      console.warn(
        "[notification] E-mail client absent — refus non envoyé (%s).",
        shortReference(input.bookingId),
      );
      return;
    }

    const car = `${input.carBrand} ${input.carModel}`;
    const reference = shortReference(input.bookingId);

    const blocks = [
      sectionBlock("Votre demande", [
        ["Véhicule", escapeHtml(car)],
        ["Du", escapeHtml(formatDate(input.startDate))],
        ["Au", escapeHtml(formatDate(input.endDate))],
      ]),
    ];

    if (input.declineReason) {
      blocks.push(
        calloutBlock(
          `<strong style="color:#1a1a1a;">Motif</strong><br>${escapeHtml(input.declineReason)}`,
        ),
      );
    }

    blocks.push(
      footerBlock(
        "N'hésitez pas à nous proposer d'autres dates ou à découvrir un autre véhicule de la flotte : nous serons ravis de vous accueillir. Pour toute question, répondez simplement à cet e-mail.",
      ),
    );

    const result = await sendEmail({
      to: input.customerEmail,
      ...(BOOKING_NOTIFICATION_EMAIL ? { replyTo: BOOKING_NOTIFICATION_EMAIL } : {}),
      subject: `Votre demande de réservation — ${car}`,
      text: buildDeclinedText({ ...input, car, reference }),
      html: renderEmail({
        title: "Demande non retenue",
        reference,
        intro: `Bonjour ${firstNameOf(input.customerName)}, nous vous remercions de votre demande. Nous sommes au regret de ne pas pouvoir y donner suite cette fois-ci.`,
        blocks,
      }),
    });
    logSendOutcome("refus client", input.bookingId, result);
  } catch (error) {
    console.error(
      "[notification] Échec de l'e-mail de refus client (%s) :",
      shortReference(input.bookingId),
      error,
    );
  }
}

function buildDeclinedText(
  data: BookingDeclinedNotificationInput & { car: string; reference: string },
): string {
  const lines = [
    `Bonjour ${firstNameOf(data.customerName)},`,
    "",
    "Nous vous remercions de votre demande de réservation chez Prestige Avenue.",
    "Nous sommes au regret de ne pas pouvoir y donner suite cette fois-ci.",
    "",
    `Référence : ${data.reference}`,
    `Véhicule  : ${data.car}`,
    `Du        : ${formatDate(data.startDate)}`,
    `Au        : ${formatDate(data.endDate)}`,
  ];

  if (data.declineReason) {
    lines.push("", `Motif : ${data.declineReason}`);
  }

  lines.push(
    "",
    "N'hésitez pas à nous proposer d'autres dates ou à découvrir un autre véhicule de la flotte.",
    "Pour toute question, répondez simplement à cet e-mail.",
    "",
    "Prestige Avenue",
  );

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────
//  Échappement
// ─────────────────────────────────────────────────────────────────────────

/** Échappe le HTML pour éviter toute injection via les champs client. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Échappe une valeur destinée à un attribut href (mailto/tel/url). */
function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/\s/g, "");
}
