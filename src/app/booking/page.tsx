import Link from "next/link";

export default function BookingPage() {
  return (
    <div className="lux-container max-w-3xl py-12">
      <div className="lux-panel space-y-4 p-8">
        <h1 className="text-4xl font-[family:var(--font-display)] text-white">Reservation</h1>
        <p className="text-zinc-300">
          Selectionnez d abord un vehicule depuis le catalogue pour lancer une reservation.
        </p>
        <Link href="/cars" className="lux-btn-primary">
          Aller au catalogue
        </Link>
      </div>
    </div>
  );
}
