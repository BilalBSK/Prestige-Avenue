import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/admin/dashboard");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="lux-container space-y-6 py-8">
      <div className="lux-panel p-5">
        <h1 className="text-3xl font-[family:var(--font-display)] text-white">Backoffice Admin</h1>
        <nav className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link href="/admin/dashboard" className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:border-zinc-600 hover:text-white">
            Dashboard
          </Link>
          <Link href="/admin/cars" className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:border-zinc-600 hover:text-white">
            Voitures
          </Link>
          <Link href="/admin/bookings" className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:border-zinc-600 hover:text-white">
            Reservations
          </Link>
          <Link href="/admin/clients" className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:border-zinc-600 hover:text-white">
            Clients
          </Link>
          <Link href="/admin/blocked-dates" className="rounded-lg border border-zinc-800 px-3 py-1.5 text-zinc-300 hover:border-zinc-600 hover:text-white">
            Blocage dates
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
