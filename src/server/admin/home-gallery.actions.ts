"use server";

import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { HOME_GALLERY_TAG } from "@/services/home-gallery.service";
import { revalidatePath, revalidateTag } from "next/cache";
import { galleryItemFormSchema, type GalleryItemInput } from "./home-gallery.schema";
import galleryDemo from "@/lib/home/gallery-demo.json";

function toPrismaData(input: GalleryItemInput) {
  return {
    mediaType: input.mediaType,
    src: input.src,
    // Le poster n'a de sens que pour une vidéo : on l'ignore pour une image.
    poster: input.mediaType === "VIDEO" ? input.poster : null,
    alt: input.alt,
    ratio: input.ratio,
    isPublished: input.isPublished,
  };
}

function revalidateGallerySurfaces() {
  revalidateTag(HOME_GALLERY_TAG);
  revalidatePath("/");
  revalidatePath("/admin/gallery");
}

export async function createGalleryItem(input: GalleryItemInput): Promise<{ id: string }> {
  await requireAdminSessionOrRedirect();
  const parsed = galleryItemFormSchema.parse(input);

  // Nouvelle tuile placée en fin de galerie.
  const last = await prisma.galleryItem.findFirst({
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });
  const created = await prisma.galleryItem.create({
    data: { ...toPrismaData(parsed), displayOrder: (last?.displayOrder ?? 0) + 1 },
  });
  revalidateGallerySurfaces();
  return { id: created.id };
}

export async function updateGalleryItem(id: string, input: GalleryItemInput): Promise<void> {
  await requireAdminSessionOrRedirect();
  const parsed = galleryItemFormSchema.parse(input);

  await prisma.galleryItem.update({ where: { id }, data: toPrismaData(parsed) });
  revalidateGallerySurfaces();
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await requireAdminSessionOrRedirect();
  await prisma.galleryItem.delete({ where: { id } });
  revalidateGallerySurfaces();
}

export async function toggleGalleryItemPublished(id: string): Promise<void> {
  await requireAdminSessionOrRedirect();
  const item = await prisma.galleryItem.findUnique({
    where: { id },
    select: { isPublished: true },
  });
  if (!item) throw new Error("Tuile introuvable.");
  await prisma.galleryItem.update({
    where: { id },
    data: { isPublished: !item.isPublished },
  });
  revalidateGallerySurfaces();
}

export async function reorderGalleryItems(orderedIds: string[]): Promise<void> {
  await requireAdminSessionOrRedirect();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.galleryItem.update({ where: { id }, data: { displayOrder: index + 1 } }),
    ),
  );
  revalidateGallerySurfaces();
}

/**
 * Importe la galerie de démonstration (les 8 visuels historiques) — déclenché
 * depuis l'état vide de l'admin. Idempotent : ne fait rien si la galerie
 * contient déjà des tuiles, pour ne jamais dupliquer ni écraser le travail
 * éditorial existant. Renvoie le nombre de tuiles insérées.
 */
export async function seedDemoGallery(): Promise<{ inserted: number }> {
  await requireAdminSessionOrRedirect();

  const existing = await prisma.galleryItem.count();
  if (existing > 0) return { inserted: 0 };

  const parsed = galleryDemo.map((raw, index) => ({
    ...galleryItemFormSchema.parse({ ...raw, isPublished: true }),
    displayOrder: index + 1,
  }));

  await prisma.galleryItem.createMany({
    data: parsed.map(({ displayOrder, ...input }) => ({
      ...toPrismaData(input),
      displayOrder,
    })),
  });
  revalidateGallerySurfaces();
  return { inserted: parsed.length };
}
