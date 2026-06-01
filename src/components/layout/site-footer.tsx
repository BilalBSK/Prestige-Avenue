import Link from "next/link";
import { SiteFooterLogo } from "./site-footer-logo";
import { GoldRule } from "@/components/ui/gold-rule";
import { SOCIALS } from "@/components/social/socials";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-[var(--ink-line)] pb-9 pt-24 md:pt-32">
      <div className="lux-container">
        <SiteFooterLogo />

        <div className="mt-10 flex justify-center">
          <GoldRule className="w-24" />
        </div>

        <div className="mt-12 flex justify-center gap-3">
          {SOCIALS.map(({ label, handle, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${label} — @${handle}`}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--ink-line)] text-[var(--ink-soft)] transition-[color,border-color,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-[var(--ink-text-soft)] hover:text-[var(--ink-ivory)]"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-[var(--ink-line)] pt-8 font-[family:var(--font-dm-sans)] text-[12px] text-[var(--ink-soft)] md:flex-row md:gap-0">
          <span>© {year} Prestige Avenue. Tous droits réservés.</span>
          <nav className="flex gap-7">
            <Link
              href="/cars"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Catalogue
            </Link>
            <Link
              href="/partenaires"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Partenaires
            </Link>
            <Link
              href="/contact"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
