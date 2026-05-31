import { prisma } from "@/lib/prisma";

export async function listCollaborationsForAdmin() {
  return prisma.collaboration.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getCollaborationForAdmin(id: string) {
  return prisma.collaboration.findUnique({ where: { id } });
}
