import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="lux-container flex min-h-[50vh] max-w-3xl items-center justify-center py-10">
      <div className="lux-panel w-full space-y-4 p-8 text-center">
        <h2 className="text-4xl font-[family:var(--font-display)] text-white">Page introuvable</h2>
        <p className="text-zinc-400">La ressource demandee n existe pas ou n est plus disponible.</p>
        <Link href="/" className="lux-btn-primary">
          Retour a l accueil
        </Link>
      </div>
    </div>
  );
}
