// Lecture seule — diagnostic de la base avant mise en prod.
// Lance : node --env-file=.env scripts/inspect-db.mjs
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const [users, cars, bookings, admins, sampleCars] = await Promise.all([
  prisma.user.count(),
  prisma.car.count(),
  prisma.booking.count(),
  prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true, name: true } }),
  prisma.car.findMany({ select: { brand: true, model: true, status: true }, take: 20 }),
]);

const host = (process.env.DATABASE_URL ?? "").split("@")[1]?.split("/")[0] ?? "?";
console.log(JSON.stringify({ host, users, cars, bookings, admins, sampleCars }, null, 2));

await prisma.$disconnect();
