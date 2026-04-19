export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Tableau de bord</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Vue d&apos;ensemble de l&apos;activité de Prestige Avenue.
        </p>
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-8 text-center">
        <p className="text-sm text-zinc-400">
          Les indicateurs clés (chiffre d&apos;affaires, taux d&apos;occupation, réservations à venir)
          arrivent prochainement.
        </p>
      </div>
    </div>
  );
}
