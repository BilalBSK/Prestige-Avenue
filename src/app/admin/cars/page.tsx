import { CarStatusActions } from "@/components/admin/car-status-actions";
import { CreateCarForm } from "@/components/admin/create-car-form";
import { prisma } from "@/lib/prisma";

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-6">
      <CreateCarForm />

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
        <h3 className="mb-4 text-lg font-semibold text-white">Flotte</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-zinc-400">
              <tr>
                <th className="px-2 py-2">Vehicule</th>
                <th className="px-2 py-2">Prix/jour</th>
                <th className="px-2 py-2">Statut</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id} className="border-t border-zinc-800 text-zinc-200">
                  <td className="px-2 py-3">
                    {car.brand} {car.model} ({car.year})
                  </td>
                  <td className="px-2 py-3">{Number(car.pricePerDay).toFixed(2)} EUR</td>
                  <td className="px-2 py-3">{car.status}</td>
                  <td className="px-2 py-3">
                    <CarStatusActions carId={car.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
