import { prisma } from "@/lib/prisma";

export async function listCarsForAdmin() {
  return prisma.car.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getCarForAdmin(id: string) {
  return prisma.car.findUnique({ where: { id } });
}
