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
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex h-11 items-center gap-3 border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)]/60 pr-4 transition-all duration-300 hover:border-[color:var(--admin-accent)]/50 hover:bg-[color:var(--admin-surface)]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="admin-serif flex h-11 w-11 items-center justify-center border-r border-[color:var(--admin-line)] bg-[color:var(--admin-bg-elev)] text-[0.85rem] font-normal tracking-wide text-[color:var(--admin-accent)] transition-colors group-hover:bg-[color:var(--admin-accent)] group-hover:text-[color:var(--admin-bg)]">
          {initials}
        </span>
        <span className="hidden flex-col items-start leading-tight md:flex">
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-[color:var(--admin-text-muted)]">
            Dirigeant
          </span>
          <span className="admin-mono max-w-[160px] truncate text-[0.7rem] text-[color:var(--admin-text-soft)]">
            {email}
          </span>
        </span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-56 border border-[color:var(--admin-line)] bg-[color:var(--admin-bg-elev)] py-1 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
          >
            <div className="border-b border-[color:var(--admin-line-soft)] px-4 py-3">
              <p className="text-[0.6rem] uppercase tracking-[0.28em] text-[color:var(--admin-text-muted)]">
                Connecté
              </p>
              <p className="admin-mono mt-1 truncate text-[0.75rem] text-[color:var(--admin-text-soft)]">
                {email}
              </p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-[0.85rem] text-[color:var(--admin-text-soft)] transition-colors hover:bg-[color:var(--admin-surface)] hover:text-[color:var(--admin-danger-soft)]"
            >
              Déconnexion
              <span className="admin-mono text-[0.65rem] text-[color:var(--admin-text-muted)]">
                ↗
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
