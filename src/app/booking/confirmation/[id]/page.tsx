import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBookingById } from "@/services/booking.service";

interface ConfirmationPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value: Date) {
  const day = String(value.getUTCDate()).padStart(2, "0");
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  return `${day}.${month}.${value.getUTCFullYear()}`;
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: "En cours de validation",
  CONFIRMED: "Confirmée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
  DECLINED: "Refusée",
};

export default async function BookingConfirmationPage({ params }: ConfirmationPageProps) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  const total = Number(booking.totalPrice);
  const refLabel = `#${booking.id.slice(-8).toUpperCase()}`;

  return (
    <main className="bg-[var(--ink-onyx)]">
      <section className="relative isolate overflow-hidden border-b border-[var(--ink-line)]">
        <div className="absolute inset-0">
          <Image
            src={booking.car.mainImage}
            alt={`${booking.car.brand} ${booking.car.model}`}
            fill
            priority
            quality={85}
            className="object-cover opacity-50"
            sizes="100vw"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.55)_0%,rgba(5,5,5,0.2)_45%,rgba(5,5,5,0.95)_100%)]"
        />
        <div className="lux-container relative z-10 flex min-h-[60vh] flex-col justify-end py-32 md:py-40">
          <p className="mb-5 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-text-soft)]">
            <span className="mr-3 inline-block h-px w-8 bg-[var(--ink-text-soft)] align-middle" />
            Demande {refLabel}
          </p>
          <h1 className="max-w-[920px] font-[family:var(--font-fraunces)] text-[clamp(40px,7vw,92px)] font-light leading-[0.95] tracking-[-0.03em] text-[var(--ink-ivory)]">
            Demande <em className="italic font-normal">reçue.</em>
          </h1>
          <p className="mt-6 max-w-[560px] font-[family:var(--font-fraunces)] text-[clamp(18px,2.2vw,24px)] font-light italic leading-[1.4] text-[var(--ink-text)]">
            Merci. Nous validons sous 24 h ouvrées et vous écrivons à{" "}
            <span className="not-italic font-normal text-[var(--ink-ivory)]">
              {booking.user.email}
            </span>
            .
          </p>
        </div>
      </section>

      <section className="lux-container py-20 md:py-28">
        <div className="grid gap-x-12 gap-y-16 md:grid-cols-[1fr_auto]">
          <div className="space-y-12">
            <div>
              <p className="mb-3 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
                — Véhicule
              </p>
              <h2 className="font-[family:var(--font-fraunces)] text-[clamp(28px,3vw,40px)] font-light leading-[1.05] tracking-[-0.02em] text-[var(--ink-ivory)]">
                {booking.car.brand} <em className="italic font-normal">{booking.car.model}.</em>
              </h2>
            </div>

            <div className="grid gap-10 border-t border-[var(--ink-line)] pt-10 sm:grid-cols-2">
              <DetailRow label="Du" value={formatDate(booking.startDate)} large />
              <DetailRow label="Au" value={formatDate(booking.endDate)} large />
              <DetailRow label="Conducteur" value={booking.user.name} />
              <DetailRow label="Téléphone" value={booking.user.phone ?? "—"} />
              <DetailRow
                label="Statut"
                value={STATUS_LABEL[booking.status] ?? booking.status}
                italic
              />
              <DetailRow
                label="Estimation"
                value={`${total.toFixed(0)} €`}
                large
              />
            </div>

            {booking.customerMessage && (
              <div className="border-t border-[var(--ink-line)] pt-10">
                <p className="mb-3 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
                  — Votre message
                </p>
                <p className="max-w-[720px] font-[family:var(--font-fraunces)] text-[clamp(18px,2vw,22px)] italic leading-[1.5] text-[var(--ink-text)]">
                  « {booking.customerMessage} »
                </p>
              </div>
            )}
          </div>

          <aside className="md:max-w-[320px]">
            <div className="border border-[var(--ink-line)] bg-[var(--ink-surface)] p-7">
              <p className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
                Et après ?
              </p>
              <ol className="mt-5 space-y-5">
                <Step
                  num="01"
                  title="Validation"
                  body="Nous étudions la demande et confirmons la disponibilité."
                />
                <Step
                  num="02"
                  title="Confirmation"
                  body="Email avec date de remise, lieu et conditions définitives."
                />
                <Step
                  num="03"
                  title="Remise des clés"
                  body="Règlement, caution et signature à la prise du véhicule."
                />
              </ol>
            </div>
          </aside>
        </div>

        <div className="mt-20 border-t border-[var(--ink-line)] pt-10">
          <Link
            href="/cars"
            className="group inline-flex items-center gap-3 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.28em] text-[var(--ink-text-soft)] transition-colors duration-200 hover:text-[var(--ink-ivory)]"
          >
            <span className="font-[family:var(--font-fraunces)] not-italic text-[16px]">←</span>
            Retour au catalogue
          </Link>
        </div>
      </section>
    </main>
  );
}

function DetailRow({
  label,
  value,
  large,
  italic,
}: {
  label: string;
  value: string;
  large?: boolean;
  italic?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
        {label}
      </p>
      <p
        className={`font-[family:var(--font-fraunces)] ${
          large
            ? "text-[clamp(28px,3vw,40px)] font-light leading-[1] tracking-[-0.02em] text-[var(--ink-ivory)]"
            : "text-[16px] text-[var(--ink-text)]"
        } ${italic ? "italic font-normal" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}

function Step({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <li className="flex gap-4">
      <span className="font-[family:var(--font-fraunces)] text-[14px] italic text-[var(--ink-dim)]">
        {num}
      </span>
      <div>
        <p className="font-[family:var(--font-fraunces)] text-[16px] text-[var(--ink-ivory)]">
          {title}
        </p>
        <p className="mt-1 font-[family:var(--font-dm-sans)] text-[12px] leading-[1.55] text-[var(--ink-text-soft)]">
          {body}
        </p>
      </div>
    </li>
  );
}
