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

// Fine fractal-noise film grain — adds tactile atmosphere over the opaque base
// so the full-screen menu reads as a designed surface, not a flat fill.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

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
        scrolled && !menuOpen
          ? "h-16 bg-[rgba(5,5,5,0.78)] backdrop-blur-xl backdrop-saturate-150"
          : "h-20 bg-transparent backdrop-blur-0 md:h-24"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-[450ms] ${
          scrolled && !menuOpen ? "opacity-100" : "opacity-0"
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
              scrolled && !menuOpen ? "text-[20px]" : "text-[22px] md:text-[26px]"
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

      {/* Full-screen mobile navigation — opaque takeover, single close control
          (the header hamburger morphs into the X above at z-60). */}
      <div
        id="mobile-menu"
        className={`fixed inset-0 z-50 md:hidden ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {/* Opaque base — fully covers the page so nothing bleeds through. */}
        <div
          className={`absolute inset-0 bg-[var(--ink-onyx)] transition-opacity duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Ambient glow — top-right warmth for depth. */}
          <div
            aria-hidden
            className={`pointer-events-none absolute -right-[20%] -top-[10%] h-[70vw] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(250,250,250,0.06),transparent_68%)] blur-3xl transition-opacity duration-[900ms] ${
              menuOpen ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* Film grain — tactile surface, not a flat fill. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-screen"
            style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }}
          />
        </div>

        {/* Menu content — pinned below the header bar, vertically composed. */}
        <nav
          aria-label="Navigation mobile"
          className="absolute inset-0 flex flex-col px-6 pt-24 pb-[max(2rem,env(safe-area-inset-bottom))]"
        >
          {/* Section label */}
          <p
            className={`flex items-center gap-3 font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.34em] text-[var(--ink-muted)] transition-all duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: menuOpen ? "160ms" : "0ms" }}
          >
            <span className="inline-block h-px w-7 bg-[var(--ink-dim)]" />
            Navigation
          </p>

          {/* Primary links — large editorial type, indexed. */}
          <div className="mt-auto flex flex-col">
            {NAV_LINKS.map((link, i) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex items-baseline gap-5 border-b border-[var(--ink-line)] py-6 transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    menuOpen ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                  }`}
                  style={{ transitionDelay: menuOpen ? `${240 + i * 90}ms` : "0ms" }}
                >
                  <span className="font-[family:var(--font-dm-sans)] text-[12px] tabular-nums text-[var(--ink-muted)] transition-colors duration-300 group-hover:text-[var(--ink-text-soft)]">
                    0{i + 1}
                  </span>
                  <span
                    className={`relative font-[family:var(--font-fraunces)] text-[clamp(2.5rem,11vw,3.75rem)] font-light leading-[0.95] tracking-[-0.02em] transition-colors duration-300 ${
                      active ? "text-[var(--ink-ivory)] italic" : "text-[var(--ink-text)] group-hover:text-[var(--ink-ivory)]"
                    }`}
                  >
                    {link.label}
                  </span>
                  <span
                    aria-hidden
                    className="ml-auto translate-x-[-10px] self-center font-[family:var(--font-fraunces)] text-[22px] not-italic text-[var(--ink-text-soft)] opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
                  >
                    →
                  </span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className={`group flex items-baseline gap-5 py-6 transition-all duration-[700ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  menuOpen ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                }`}
                style={{ transitionDelay: menuOpen ? `${240 + NAV_LINKS.length * 90}ms` : "0ms" }}
              >
                <span className="font-[family:var(--font-dm-sans)] text-[12px] tabular-nums text-[var(--ink-muted)]">
                  ✦
                </span>
                <span className="font-[family:var(--font-fraunces)] text-[28px] font-light italic text-[var(--ink-text-soft)] transition-colors duration-300 group-hover:text-[var(--ink-ivory)]">
                  Espace admin
                </span>
              </Link>
            )}
          </div>

          {/* Socials footer */}
          <div
            className={`mt-10 flex items-center justify-between border-t border-[var(--ink-line)] pt-6 transition-all duration-[700ms] ease-out ${
              menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
            style={{ transitionDelay: menuOpen ? `${320 + NAV_LINKS.length * 90}ms` : "0ms" }}
          >
            <span className="font-[family:var(--font-dm-sans)] text-[10px] uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              Suivez-nous
            </span>
            <div className="flex items-center gap-1">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center text-[var(--ink-text-soft)] transition-colors duration-300 hover:text-[var(--ink-ivory)]"
                >
                  <Icon className="h-[18px] w-[18px]" />
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
