"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Petit libellé au-dessus du titre (ex. référence). */
  eyebrow?: ReactNode;
  children: ReactNode;
  /** Barre d'actions collée en bas (optionnelle). */
  footer?: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Tiroir latéral aux jetons du thème admin (le Sheet public utilise --ink-*).
 * Piège le focus, ferme sur Échap / clic sur le fond, restaure le focus au
 * démontage. Respecte prefers-reduced-motion via l'animation CSS conditionnelle.
 */
export function Drawer({ open, onClose, title, eyebrow, children, footer }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  // Monté côté client uniquement : le portail vise document.body, indisponible au SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current = (document.activeElement as HTMLElement | null) ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => {
      const node = panelRef.current;
      if (!node) return;
      (node.querySelector<HTMLElement>(FOCUSABLE) ?? node).focus();
    }, 30);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      lastActiveRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const node = panelRef.current;
      if (!node) return;
      const focusables = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null,
      );
      if (focusables.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  // Rendu en portail sur <body> : le tiroir échappe ainsi à tout contexte
  // d'empilement / overflow d'un ancêtre (notamment <main class="isolate">) et
  // se superpose toujours au-dessus de la barre supérieure et de la sidebar.
  return createPortal(
    <div
      className="admin-theme fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px] animate-[admin-drawer-fade_200ms_ease-out_forwards]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col bg-[color:var(--admin-bg-elev)] shadow-[-24px_0_60px_-20px_rgba(0,0,0,0.7)] outline-none animate-[admin-drawer-in_300ms_cubic-bezier(0.16,1,0.3,1)_forwards]"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-[color:var(--admin-line)] px-5 py-4">
          <div className="min-w-0">
            {eyebrow && (
              <div className="admin-mono mb-0.5 text-[0.6875rem] text-[color:var(--admin-text-muted)]">
                {eyebrow}
              </div>
            )}
            <h2 className="truncate text-[0.9375rem] font-semibold text-[color:var(--admin-text)]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="-mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="shrink-0 border-t border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] px-5 py-3">
            {footer}
          </footer>
        )}
      </div>

      <style>{`
        @keyframes admin-drawer-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes admin-drawer-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [aria-modal="true"] *[class*="admin-drawer-"] { animation: none !important; }
        }
      `}</style>
    </div>,
    document.body,
  );
}
