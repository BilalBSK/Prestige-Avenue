import Link from "next/link";

export default function BookingCancelPage() {
  return (
    <div className="lux-container max-w-3xl py-12">
      <div className="lux-panel space-y-4 p-8">
        <h1 className="text-4xl font-[family:var(--font-display)] text-white">Paiement annule</h1>
        <p className="text-zinc-300">
          Le paiement a ete annule. Aucune reservation confirmee n a ete creee.
        </p>
        <Link href="/cars" className="lux-btn-primary">
          Retour au catalogue
        </Link>
      </div>
    </div>
  );
}
