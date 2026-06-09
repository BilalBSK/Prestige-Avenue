import { calculateRentalDays } from "@/lib/booking";
import { BOOKING_NOTIFICATION_EMAIL, sendEmail } from "@/lib/email";

/**
 * Notifications e-mail liées aux réservations.
 *
 * Règle d'or : ces fonctions **n'échouent jamais** vis-à-vis de l'appelant.
 * Une réservation ne doit pas être perdue parce qu'un e-mail n'est pas parti.
 * En cas de problème (config absente, Resend KO…) on log et on continue.
 */

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

/** Référence courte et lisible affichée à l'agence (identique à l'admin). */
function shortReference(bookingId: string): string {
  return `#${bookingId.slice(-8).toUpperCase()}`;
}

/** URL absolue vers la liste des réservations de l'admin (demandes en tête). */
function adminBookingsUrl(): string | null {
  const base = process.env.NEXTAUTH_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/admin/bookings`;
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
      console.warn(
        "[notification] BOOKING_NOTIFICATION_EMAIL absente — alerte non envoyée (%s).",
        shortReference(input.bookingId),
      );
      return;
    }

    const car = `${input.carBrand} ${input.carModel}`;
    const reference = shortReference(input.bookingId);
    const rentalDays = calculateRentalDays(input.startDate, input.endDate);
    const subject = `Nouvelle demande — ${car} (${reference})`;

    await sendEmail({
      to: BOOKING_NOTIFICATION_EMAIL,
      // Permet à l'agence de répondre directement au client depuis sa boîte.
      replyTo: input.customerEmail,
      subject,
      text: buildText({ ...input, car, reference, rentalDays }),
      html: buildHtml({ ...input, car, reference, rentalDays }),
    });
  } catch (error) {
    console.error(
      "[notification] Échec de l'alerte de nouvelle demande (%s) :",
      shortReference(input.bookingId),
      error,
    );
  }
}

interface RenderInput extends NewBookingNotificationInput {
  car: string;
  reference: string;
  rentalDays: number;
}

/** Version texte brut — repli et bonne délivrabilité. */
function buildText(data: RenderInput): string {
  const lines = [
    `Nouvelle demande de réservation — ${data.reference}`,
    "",
    `Véhicule    : ${data.car}`,
    `Période     : du ${formatDate(data.startDate)} au ${formatDate(data.endDate)} (${data.rentalDays} jour${data.rentalDays > 1 ? "s" : ""})`,
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

/** Version HTML — tables inline pour la compatibilité clients mail. */
function buildHtml(data: RenderInput): string {
  const url = adminBookingsUrl();

  const messageBlock = data.customerMessage
    ? `<tr><td style="padding:20px 28px 0;">
         <p style="margin:0 0 6px;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a8a8a;">Message du client</p>
         <p style="margin:0;padding:14px 16px;background:#f6f4ef;border-left:3px solid #c9a24e;border-radius:4px;font:italic 15px/1.6 Georgia,serif;color:#2a2a2a;">${escapeHtml(data.customerMessage)}</p>
       </td></tr>`
    : "";

  const ctaBlock = url
    ? `<tr><td style="padding:28px;" align="center">
         <a href="${url}" style="display:inline-block;padding:13px 30px;background:#161616;color:#ffffff;font:600 14px/1 Arial,sans-serif;letter-spacing:.04em;text-decoration:none;border-radius:6px;">Gérer la demande</a>
       </td></tr>`
    : "";

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:11px 0;border-bottom:1px solid #ececec;font:13px/1.4 Arial,sans-serif;color:#8a8a8a;width:38%;vertical-align:top;">${label}</td>
      <td style="padding:11px 0;border-bottom:1px solid #ececec;font:600 15px/1.4 Arial,sans-serif;color:#1a1a1a;vertical-align:top;">${value}</td>
    </tr>`;

  const phone = data.customerPhone
    ? `<a href="tel:${escapeAttr(data.customerPhone)}" style="color:#1a1a1a;text-decoration:none;">${escapeHtml(data.customerPhone)}</a>`
    : '<span style="color:#b0b0b0;">non renseigné</span>';

  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0eee9;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0eee9;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">

        <tr><td style="background:#161616;padding:26px 28px;">
          <p style="margin:0;font:600 12px/1 Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;color:#c9a24e;">Prestige Avenue</p>
          <h1 style="margin:8px 0 0;font:600 22px/1.3 Georgia,serif;color:#ffffff;">Nouvelle demande de réservation</h1>
          <p style="margin:6px 0 0;font:13px/1.4 Arial,sans-serif;color:#9a9a9a;">Référence ${data.reference}</p>
        </td></tr>

        <tr><td style="padding:24px 28px 4px;">
          <p style="margin:0 0 4px;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a8a8a;">Réservation</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row("Véhicule", escapeHtml(data.car))}
            ${row("Du", escapeHtml(formatDate(data.startDate)))}
            ${row("Au", escapeHtml(formatDate(data.endDate)))}
            ${row("Durée", `${data.rentalDays} jour${data.rentalDays > 1 ? "s" : ""}`)}
            ${row("Prix estimé", `<span style="color:#c9a24e;">${escapeHtml(formatEUR(data.totalPrice))}</span>`)}
          </table>
        </td></tr>

        <tr><td style="padding:20px 28px 4px;">
          <p style="margin:0 0 4px;font:600 12px/1.4 Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#8a8a8a;">Client</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row("Nom", escapeHtml(data.customerName))}
            ${row("E-mail", `<a href="mailto:${escapeAttr(data.customerEmail)}" style="color:#1a1a1a;text-decoration:none;">${escapeHtml(data.customerEmail)}</a>`)}
            ${row("Téléphone", phone)}
          </table>
        </td></tr>

        ${messageBlock}
        ${ctaBlock}

        <tr><td style="padding:18px 28px;background:#faf9f6;border-top:1px solid #ececec;">
          <p style="margin:0;font:13px/1.6 Arial,sans-serif;color:#8a8a8a;">Aucune date n'est encore bloquée : la demande attend votre validation dans l'espace admin. C'est à l'agence de recontacter le client.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Échappe le HTML pour éviter toute injection via les champs client. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Échappe une valeur destinée à un attribut href (mailto/tel). */
function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/\s/g, "");
}
