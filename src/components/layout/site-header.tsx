import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user.role === "ADMIN";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-900/50 bg-black/90">
      <div className="lux-container flex items-center justify-between py-4">
        <Link
          href="/"
          className="inline-flex px-1 py-1"
        >
          <Image
            src="/logo/logo.png"
            alt="Prestige Avenue"
            width={220}
            height={52}
            priority
            className="h-9 w-auto object-contain md:h-11"
          />
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/cars" className="text-zinc-300 transition hover:text-white">
            Catalogue
          </Link>
          {isAdmin ? (
            <Link href="/admin/dashboard" className="text-zinc-300 transition hover:text-white">
              Admin
            </Link>
          ) : (
            <Link href="/admin/login" className="text-zinc-400 transition hover:text-zinc-200">
              Acces admin
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
