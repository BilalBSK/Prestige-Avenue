"use client";

import type { ContactValues } from "./booking-step-contact";

interface BookingStepReviewProps {
  brand: string;
  model: string;
  startDate: string;
  endDate: string;
  estimatedTotal: number;
  pricePerKm: number | null;
  contact: ContactValues;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  serverError: string;
}

function formatDate(value: string) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return `${d}.${m}.${y}`;
}

export function BookingStepReview({
  brand,
  model,
  startDate,
  endDate,
  estimatedTotal,
  pricePerKm,
  contact,
  onBack,
  onSubmit,
  submitting,
  serverError,
}: BookingStepReviewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-5 pb-8 pt-8 sm:px-8">
        <div>
          <p className="mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            <span className="mr-3 inline-block h-px w-6 bg-[var(--ink-dim)] align-middle" />
            Récapitulatif
          </p>
          <h3 className="font-[family:var(--font-fraunces)] text-[26px] font-light leading-[1.15] tracking-[-0.02em] text-[var(--ink-ivory)]">
            Tout est <em className="italic font-normal">en ordre.</em>
          </h3>
        </div>

        <ReviewBlock title="Véhicule">
          <ReviewRow label="Modèle" value={`${brand} ${model}`} italic />
        </ReviewBlock>

        <ReviewBlock title="Période">
          <ReviewRow label="Du" value={formatDate(startDate)} />
          <ReviewRow label="Au" value={formatDate(endDate)} />
          <ReviewRow
            label="Estimation"
            value={estimatedTotal > 0 ? `${estimatedTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : "—"}
            emphasis
          />
          {pricePerKm !== null && (
            <p className="-mt-1 font-[family:var(--font-dm-sans)] text-[11px] leading-[1.55] text-[var(--ink-muted)]">
              Hors kilométrage — facturé au retour à {pricePerKm.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €/km.
            </p>
          )}
        </ReviewBlock>

        <ReviewBlock title="Contact">
          <ReviewRow label="Nom" value={`${contact.firstName} ${contact.lastName}`} />
          <ReviewRow label="Email" value={contact.email} />
          <ReviewRow label="Téléphone" value={contact.phone} />
          {contact.customerMessage && (
            <div className="border-t border-[var(--ink-line)] pt-4">
              <p className="mb-2 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
                Message
              </p>
              <p className="font-[family:var(--font-fraunces)] text-[14px] italic leading-[1.55] text-[var(--ink-text)]">
                « {contact.customerMessage} »
              </p>
            </div>
          )}
        </ReviewBlock>

        <div className="border border-[var(--ink-line)] bg-[var(--ink-surface)] p-5">
          <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.24em] text-[var(--ink-muted)]">
            Et après ?
          </p>
          <ul className="mt-3 space-y-1.5 font-[family:var(--font-dm-sans)] text-[12px] leading-[1.6] text-[var(--ink-text-soft)]">
            <li>— Vous recevez une confirmation immédiate par email.</li>
            <li>— Notre équipe valide la demande sous 24 h ouvrées.</li>
            <li>— Aucun paiement en ligne. Règlement à la remise des clés.</li>
          </ul>
        </div>

        {serverError && (
          <p className="border border-[var(--ink-line-soft)] bg-[var(--ink-elevated)] p-4 font-[family:var(--font-fraunces)] text-[14px] italic text-[var(--ink-ivory)]">
            {serverError}
          </p>
        )}
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-3 border-t border-[var(--ink-line)] bg-[var(--ink-onyx)] px-5 py-5 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="border border-[var(--ink-line-soft)] bg-transparent px-6 py-3.5 font-[family:var(--font-dm-sans)] text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--ink-text-soft)] transition-colors duration-200 hover:border-[var(--ink-text-soft)] hover:text-[var(--ink-ivory)] disabled:opacity-50"
        >
          Retour
        </button>
        <button
          type="button"
          disabled={submitting}
          onClick={onSubmit}
          className="border border-[var(--ink-ivory)] bg-[var(--ink-ivory)] px-6 py-3.5 font-[family:var(--font-dm-sans)] text-[12px] font-medium uppercase tracking-[0.3em] text-[var(--ink-onyx)] transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Envoi…" : "Envoyer la demande"}
        </button>
      </div>
    </div>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-[var(--ink-line)] pt-6">
      <p className="mb-4 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
        {title}
      </p>
      <div className="space-y-3.5">{children}</div>
    </div>
  );
}

function ReviewRow({
  label,
  value,
  italic,
  emphasis,
}: {
  label: string;
  value: string;
  italic?: boolean;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <p className="font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.22em] text-[var(--ink-text-soft)]">
        {label}
      </p>
      <p
        className={`font-[family:var(--font-fraunces)] ${
          emphasis
            ? "text-[28px] font-light leading-none tracking-[-0.02em] text-[var(--ink-ivory)]"
            : "text-[15px] text-[var(--ink-text)]"
        } ${italic ? "italic font-normal" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
