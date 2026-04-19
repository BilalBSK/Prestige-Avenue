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
        className="flex h-9 items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-2 pr-3 text-sm text-zinc-200 hover:bg-zinc-800"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-black">
          {initials}
        </span>
        <span className="hidden max-w-[160px] truncate md:block">{email}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-950 py-1 shadow-xl">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="block w-full px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-900"
            >
              Déconnexion
            </button>
          </div>
        </>
      )}
    </div>
  );
}
