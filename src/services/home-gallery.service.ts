import { prisma } from "@/lib/prisma";
import { GALLERY_RATIOS, type GalleryItem } from "@/lib/home/gallery-items";
import { unstable_cache } from "next/cache";

export const HOME_GALLERY_TAG = "home-gallery:list";

/**
 * Tuiles publiées de la galerie d'accueil, prêtes pour l'affichage, dans
 * l'ordre `displayOrder`. Mappe les lignes Prisma vers le shape `GalleryItem`
 * consommé par les composants (`type`/`src`/`poster`/`alt`/`w`/`h`).
 *
 * Résilience : si la table n'existe pas encore (migration non appliquée sur un
 * environnement neuf) ou que la base hoquette, on dégrade vers « aucune tuile »
 * plutôt que de faire tomber tout le rendu de la home — la galerie est une
 * respiration visuelle, pas un contenu critique. Même parti pris que
 * `collaboration.service.ts`.
 */
export const getGalleryItems = unstable_cache(
  async (): Promise<GalleryItem[]> => {
    let rows;
    try {
      rows = await prisma.galleryItem.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      });
    } catch (error) {
      console.error("[home-gallery.service] findMany failed, hiding gallery:", error);
      return [];
    }

    return rows.map((row) => {
      const { w, h } = GALLERY_RATIOS[row.ratio];
      return {
        type: row.mediaType === "VIDEO" ? "video" : "image",
        src: row.src,
        poster: row.poster ?? undefined,
        alt: row.alt,
        w,
        h,
      };
    });
  },
  ["home-gallery:items"],
  { tags: [HOME_GALLERY_TAG], revalidate: 300 },
);
