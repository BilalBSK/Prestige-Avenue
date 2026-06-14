import { prisma } from "@/lib/prisma";

/** Toutes les tuiles de la galerie (publiées ou non), pour l'admin. */
export async function listGalleryItemsForAdmin() {
  return prisma.galleryItem.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });
}
