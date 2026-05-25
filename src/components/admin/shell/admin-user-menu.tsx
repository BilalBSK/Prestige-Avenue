"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

interface AdminUserMenuProps {
  name: string | null | undefined;
  email: string | null | undefined;
}

export function AdminUserMenu({ name, email }: AdminUserMenuProps) {
  const [open, setOpen] = useState(false);
  const initials = (name ?? email ?? "?")
    .split(/\s|\./)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-transparent px-1.5 py-1 text-left transition-colors hover:bg-[color:var(--admin-surface)]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--admin-surface-2)] text-[0.7rem] font-semibold text-[color:var(--admin-text)] ring-1 ring-inset ring-[color:var(--admin-line-strong)]">
          {initials}
        </span>
        <span className="hidden flex-col leading-tight md:flex">
          <span className="text-[0.75rem] font-medium text-[color:var(--admin-text)]">
            {name ?? "Admin"}
          </span>
          <span className="max-w-[160px] truncate text-[0.6875rem] text-[color:var(--admin-text-muted)]">
            {email}
          </span>
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className="ml-1 text-[color:var(--admin-text-muted)]"
          aria-hidden
        >
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.25" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-1.5 w-60 overflow-hidden rounded-md border border-[color:var(--admin-line)] bg-[color:var(--admin-bg-elev)] py-1 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.6)]"
          >
            <div className="border-b border-[color:var(--admin-line)] px-3 py-2.5">
              <p className="truncate text-[0.8125rem] font-medium text-[color:var(--admin-text)]">
                {name ?? "Admin"}
              </p>
              <p className="truncate text-[0.75rem] text-[color:var(--admin-text-muted)]">
                {email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[0.8125rem] text-[color:var(--admin-text-soft)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-text)]"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M8.5 3V2a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1M11 5l2 2-2 2M6 7h7" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Déconnexion
            </button>
          </div>
        </>
      )}
    </div>
  );
}
