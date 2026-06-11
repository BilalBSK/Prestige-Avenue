"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminBrand, AdminNavList } from "./admin-sidebar";
import { AdminViewSiteFooter } from "./admin-view-site";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Déplace le focus dans le tiroir pour la navigation clavier / lecteur d'écran.
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    // Rend le focus au déclencheur à la fermeture.
    triggerRef.current?.focus();
  };

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-[color:var(--admin-line-strong)] text-[color:var(--admin-text-soft)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
          <path d="M2.5 5h13M2.5 9h13M2.5 13h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Scrim */}
      <div
        onClick={close}
        aria-hidden
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-[3px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Tiroir */}
      <aside
        inert={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[82vw] flex-col border-r border-[color:var(--admin-line-strong)] bg-[color:var(--admin-bg-elev)] shadow-[0_0_60px_-12px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-[color:var(--admin-line)] px-5">
          <AdminBrand />
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Fermer le menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <p className="px-6 pb-1 pt-4 text-[0.625rem] font-medium uppercase tracking-[0.18em] text-[color:var(--admin-text-muted)]">
            Navigation
          </p>
          <AdminNavList variant="drawer" stagger={open} onNavigate={close} />
        </div>

        <AdminViewSiteFooter onNavigate={close} />
      </aside>
    </div>
  );
}
