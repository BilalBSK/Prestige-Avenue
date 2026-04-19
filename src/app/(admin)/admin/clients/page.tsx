import { prisma } from "@/lib/prisma";

export default async function AdminClientsPage() {
  const users = await prisma.user.findMany({
    include: {
      bookings: {
        orderBy: { createdAt: "desc" },
        take: 3,
        include: {
          car: { select: { brand: true, model: true } },
        },
      },
      _count: {
        select: { bookings: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">Clients</h2>
      <div className="space-y-3">
        {users.map((user) => (
          <article key={user.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium text-white">{user.name}</p>
                <p className="text-sm text-zinc-400">
                  {user.email} {user.phone ? `- ${user.phone}` : ""}
                </p>
              </div>
              <span className="text-sm text-zinc-300">
                {user._count.bookings} reservation(s)
              </span>
            </div>
            {user.bookings.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-zinc-400">
                {user.bookings.map((booking) => (
                  <li key={booking.id}>
                    {booking.car.brand} {booking.car.model} - {booking.status} (
                    {booking.startDate.toISOString().slice(0, 10)})
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
