import Link from "next/link";

interface SuccessPageProps {
  searchParams: Promise<{ bookingId?: string }>;
}

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  return (
    <div className="lux-container max-w-3xl py-12">
      <div className="lux-panel space-y-4 p-8">
        <h1 className="text-4xl font-[family:var(--font-display)] text-white">Paiement confirme</h1>
        <p className="text-zinc-300">
          Votre acompte (40%) a ete recu. Votre reservation sera confirmee automatiquement.
        </p>
        {params.bookingId && (
          <p className="text-sm text-zinc-500">Session Stripe: {params.bookingId}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <Link href="/cars" className="lux-btn-primary">
            Reserver un autre vehicule
          </Link>
          <Link href="/" className="lux-btn-secondary">
            Retour accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
