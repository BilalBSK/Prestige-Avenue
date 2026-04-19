"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/cars", label: "Voitures" },
  { href: "/admin/bookings", label: "Réservations" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/blocked-dates", label: "Dates bloquées" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-950 lg:block">
      <div className="flex h-16 items-center border-b border-zinc-800 px-6">
        <Link href="/admin/dashboard" className="text-sm font-semibold tracking-wide text-white">
          Prestige Avenue
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-amber-500 text-black"
                  : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
