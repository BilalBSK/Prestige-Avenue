"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";
import { SOCIALS } from "@/components/social/socials";

export interface SiteHeaderClientProps {
  isAdmin: boolean;
}

const NAV_LINKS = [
  { href: "/cars", label: "Catalogue" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeaderClient({ isAdmin }: SiteHeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock background scroll + close on Escape while the menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    lockScroll();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[height,background-color,backdrop-filter] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled ? "h-16" : "h-20 md:h-24"
      } ${
        scrolled || menuOpen
          ? "bg-[rgba(5,5,5,0.85)] backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent backdrop-blur-0"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-[450ms] ${
          scrolled || menuOpen ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--ink-line) 18%, var(--ink-line-soft) 50%, var(--ink-line) 82%, transparent 100%)",
        }}
      />

      <div className="lux-container flex h-full items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Prestige Avenue — Accueil"
          className="group relative z-[60] font-[family:var(--font-fraunces)] font-light leading-none tracking-[-0.01em] text-[var(--ink-ivory)] transition-[font-size,letter-spacing] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <span
            className={`block transition-all duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              scrolled ? "text-[20px]" : "text-[22px] md:text-[26px]"
            }`}
          >
            Prestige <em className="font-normal italic">Avenue</em>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Navigation principale"
          className="hidden items-center gap-7 font-[family:var(--font-dm-sans)] text-[11px] uppercase tracking-[0.22em] md:flex md:gap-9"
        >
          {NAV_LINKS.map((link) => (
            <HeaderLink key={link.href} href={link.href} label={link.label} />
          ))}

          {isAdmin && (
            <>
              <span
                aria-hidden
                className="hidden h-3 w-px bg-[var(--ink-line-soft)] md:block"
              />
              <Link
                href="/admin/dashboard"
                className="font-[family:var(--font-fraunces)] text-[13px] italic normal-case tracking-[0.02em] text-[var(--ink-text-soft)] transition-colors duration-300 hover:text-[var(--ink-ivory)]"
              >
                Admin
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger / close — sits above the overlay so it stays tappable */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="relative z-[60] -mr-1 flex h-10 w-10 items-center justify-center text-[var(--ink-ivory)] md:hidden"
        >
          <span className="relative block h-[14px] w-[22px]">
            <span
              className={`absolute left-0 block h-px w-full bg-current transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1/2 block h-px w-full -translate-y-1/2 bg-current transition-opacity duration-200 ${
                menuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-full bg-current transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                menuOpen ? "bottom-1/2 translate-y-1/2 -rotate-45" : "bottom-0"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile navigation — compact floating dropdown anchored under the icon.
          Does NOT cover the page: a light scrim keeps the page visible behind. */}
      <div className="md:hidden">
        {/* Light scrim — page stays visible; tap anywhere to close. Mouse/touch
            affordance only (keyboard closes with Escape), so never a tab stop. */}
        <button
          type="button"
          aria-label="Fermer le menu"
          tabIndex={-1}
          onClick={() => setMenuOpen(false)}
          className={`fixed inset-0 z-30 cursor-default bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ease-out ${
            menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        {/* Dropdown panel — hangs from the bar, anchored right.
            `inert` when closed removes its links from tab order + a11y tree. */}
        <nav
          id="mobile-menu"
          aria-label="Navigation mobile"
          inert={!menuOpen}
          className={`absolute right-4 top-full z-40 mt-2.5 w-[min(20rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-[var(--ink-line-soft)] bg-[rgba(12,12,14,0.96)] shadow-[0_30px_80px_-28px_rgba(0,0,0,0.95)] backdrop-blur-xl transition-[opacity,transform] duration-[260ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen
              ? "translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-[0.97] opacity-0"
          }`}
        >
          {/* Hairline highlight along the top edge for depth. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--ink-line-soft)] to-transparent"
          />

          <div className="p-2.5">
            <p className="flex items-center gap-2.5 px-3 pb-2.5 pt-1.5 font-[family:var(--font-dm-sans)] text-[9px] uppercase tracking-[0.32em] text-[var(--ink-muted)]">
              <span className="inline-block h-px w-5 bg-[var(--ink-dim)]" />
              Navigation
            </p>

            {NAV_LINKS.map((link, i) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors duration-200 ${
                    active
                      ? "bg-[var(--ink-elevated)]"
                      : "hover:bg-[var(--ink-elevated)]"
                  }`}
                >
                  <span
                    className={`font-[family:var(--font-dm-sans)] text-[10px] tabular-nums transition-colors duration-200 ${
                      active ? "text-[var(--ink-text-soft)]" : "text-[var(--ink-muted)] group-hover:text-[var(--ink-text-soft)]"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className={`font-[family:var(--font-fraunces)] text-[18px] font-light leading-none tracking-[-0.01em] transition-colors duration-200 ${
                      active ? "italic text-[var(--ink-ivory)]" : "text-[var(--ink-text)] group-hover:text-[var(--ink-ivory)]"
                    }`}
                  >
                    {link.label}
                  </span>
                  <span
                    aria-hidden
                    className={`ml-auto text-[15px] transition-all duration-200 ease-out ${
                      active
                        ? "translate-x-0 text-[var(--ink-text-soft)] opacity-100"
                        : "-translate-x-1.5 text-[var(--ink-muted)] opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                    }`}
                  >
                    →
                  </span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="group mt-0.5 flex items-center gap-3.5 rounded-xl px-3 py-3 transition-colors duration-200 hover:bg-[var(--ink-elevated)]"
              >
                <span className="font-[family:var(--font-dm-sans)] text-[10px] text-[var(--ink-muted)] group-hover:text-[var(--ink-text-soft)]">
                  ✦
                </span>
                <span className="font-[family:var(--font-fraunces)] text-[16px] font-light italic text-[var(--ink-text-soft)] transition-colors duration-200 group-hover:text-[var(--ink-ivory)]">
                  Espace admin
                </span>
              </Link>
            )}
          </div>

          {/* Socials footer */}
          <div className="flex items-center justify-between border-t border-[var(--ink-line)] bg-[var(--ink-onyx)] px-5 py-3.5">
            <span className="font-[family:var(--font-dm-sans)] text-[9px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">
              Suivez-nous
            </span>
            <div className="flex items-center gap-0.5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center text-[var(--ink-text-soft)] transition-colors duration-200 hover:text-[var(--ink-ivory)]"
                >
                  <Icon className="h-[16px] w-[16px]" />
                </a>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="header-link group relative text-[var(--ink-text-soft)] transition-colors duration-300 hover:text-[var(--ink-ivory)]"
    >
      <span className="relative inline-block">
        {label}
        <span
          aria-hidden
          className="header-underline pointer-events-none absolute -bottom-1.5 left-0 right-0 h-px origin-left scale-x-0 bg-[var(--ink-ivory)] transition-transform duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
        />
      </span>
    </Link>
  );
}
