import Link from "next/link";
import { SiteFooterLogo } from "./site-footer-logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-32 border-t border-[var(--ink-line)] pb-9 pt-24 md:pt-32">
      <div className="lux-container">
        <SiteFooterLogo />
        <div className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-[var(--ink-line)] pt-8 font-[family:var(--font-dm-sans)] text-[12px] text-[var(--ink-soft)] md:flex-row md:gap-0">
          <span>© {year} Prestige Avenue. Tous droits reserves.</span>
          <nav className="flex gap-7">
            <Link
              href="/cars"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Catalogue
            </Link>
            <Link
              href="/admin/login"
              className="transition-colors duration-200 hover:text-[var(--ink-ivory)]"
            >
              Accès admin
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
