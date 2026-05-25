"use client";

import { useRevealOnScroll } from "@/hooks/use-reveal-on-scroll";
import { ClockIcon, MailIcon, PhoneIcon, PinIcon } from "./contact-icons";

interface ContactCoordinatesProps {
  address: { line1: string; line2: string };
  phones: string[];
  email: string;
  hours: string;
}

export function ContactCoordinates({
  address,
  phones,
  email,
  hours,
}: ContactCoordinatesProps) {
  const ref = useRevealOnScroll<HTMLDivElement>({ threshold: 0.1 });

  const phoneTel = (display: string) => `+33${display.replace(/\D/g, "").slice(1)}`;

  return (
    <section className="bg-[var(--ink-surface)] pb-2 pt-14 md:pb-3 md:pt-20">
      <div className="lux-container">
        <div className="contact-heading-block mb-10 md:mb-14">
          <h2 className="font-[family:var(--font-fraunces)] text-[clamp(30px,3.8vw,46px)] font-light leading-[1] tracking-[-0.025em] text-[var(--ink-ivory)]">
            Nos <em className="italic font-normal">coordonnées.</em>
          </h2>
          <span aria-hidden className="contact-heading-rule" />
        </div>

        <div
          ref={ref}
          className="reveal-stagger grid grid-cols-1 border-t border-[var(--ink-line)] md:grid-cols-3"
        >
          <ContactCell icon={<PinIcon className="h-5 w-5" />} eyebrow="Adresse">
            <p className="contact-cell-value">
              <span className="block">{address.line1}</span>
              <span className="block">{address.line2}</span>
            </p>
          </ContactCell>

          <ContactCell
            icon={<PhoneIcon className="h-5 w-5" />}
            eyebrow={phones.length > 1 ? "Téléphones" : "Téléphone"}
          >
            <div className="space-y-1.5">
              {phones.map((phone) => (
                <a
                  key={phone}
                  href={`tel:${phoneTel(phone)}`}
                  className="contact-cell-link block"
                >
                  {phone}
                </a>
              ))}
              <p className="contact-cell-meta mt-4 flex items-center gap-2">
                <ClockIcon className="h-3.5 w-3.5 flex-shrink-0 text-[var(--ink-muted)]" />
                <span>{hours}</span>
              </p>
            </div>
          </ContactCell>

          <ContactCell icon={<MailIcon className="h-5 w-5" />} eyebrow="Email">
            <a href={`mailto:${email}`} className="contact-cell-link break-all">
              {email}
            </a>
            <p className="contact-cell-meta mt-4">
              Réponse sous 24 h ouvrées.
            </p>
          </ContactCell>
        </div>
      </div>
    </section>
  );
}

function ContactCell({
  icon,
  eyebrow,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative border-b border-[var(--ink-line)] px-0 py-8 md:border-b-0 md:px-9 md:py-10 md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-[var(--ink-line)] md:first:pl-0 last:border-b-0">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[var(--ink-line-soft)] transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 md:hidden"
      />
      <div className="flex items-start gap-5">
        <div
          aria-hidden
          className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[var(--ink-line)] text-[var(--ink-text-soft)] transition-colors duration-300 group-hover:border-[var(--ink-text-soft)] group-hover:text-[var(--ink-ivory)]"
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-3 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
            {eyebrow}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}
