"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AdminBrand, AdminNavList } from "./admin-sidebar";
import { AdminViewSiteFooter } from "./admin-view-site";

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
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

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-[3px] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] max-w-[80vw] flex-col border-r border-[color:var(--admin-line)] bg-[color:var(--admin-bg-elev)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex h-14 items-center justify-between border-b border-[color:var(--admin-line)] px-5">
          <AdminBrand />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer le menu"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[color:var(--admin-text-muted)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <AdminNavList onNavigate={() => setOpen(false)} />
        <AdminViewSiteFooter onNavigate={() => setOpen(false)} />
      </aside>
    </div>
  );
}
