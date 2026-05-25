"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export interface SiteHeaderClientProps {
  isAdmin: boolean;
}

export function SiteHeaderClient({ isAdmin }: SiteHeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[height,background-color,backdrop-filter] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled
          ? "h-16 bg-[rgba(5,5,5,0.78)] backdrop-blur-xl backdrop-saturate-150"
          : "h-20 bg-transparent backdrop-blur-0 md:h-24"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-px transition-opacity duration-[450ms] ${
          scrolled ? "opacity-100" : "opacity-0"
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
          className="group relative font-[family:var(--font-fraunces)] font-light leading-none tracking-[-0.01em] text-[var(--ink-ivory)] transition-[font-size,letter-spacing] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <span
            className={`block transition-all duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              scrolled ? "text-[20px]" : "text-[22px] md:text-[26px]"
            }`}
          >
            Prestige <em className="font-normal italic">Avenue</em>
          </span>
        </Link>

        <nav
          aria-label="Navigation principale"
          className="flex items-center gap-7 font-[family:var(--font-dm-sans)] text-[12px] uppercase tracking-[0.22em] md:gap-9 md:text-[11px]"
        >
          <HeaderLink href="/cars" label="Catalogue" />
          <HeaderLink href="/contact" label="Contact" />

          {isAdmin && (
            <>
              <span
                aria-hidden
                className="hidden h-3 w-px bg-[var(--ink-line-soft)] md:block"
              />
              <Link
                href="/admin/dashboard"
                className="hidden font-[family:var(--font-fraunces)] text-[13px] italic normal-case tracking-[0.02em] text-[var(--ink-text-soft)] transition-colors duration-300 hover:text-[var(--ink-ivory)] md:inline-flex"
              >
                Admin
              </Link>
            </>
          )}
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
