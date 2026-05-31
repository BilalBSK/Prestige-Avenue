import { prisma } from "@/lib/prisma";
import {
  collaborationPhotoSchema,
  type CollaborationPhoto,
} from "@/server/admin/collaborations.schema";
import { unstable_cache } from "next/cache";
import { z } from "zod";

export const COLLABORATIONS_TAG = "collaborations:list";

const photosSchema = z.array(collaborationPhotoSchema);

/** Une photo prête pour le carrousel public : média + crédit du partenaire. */
export interface CollaborationSlide extends CollaborationPhoto {
  partnerName: string;
  partnerUrl: string | null;
}

/**
 * Aplatit toutes les collaborations publiées en un seul ruban de photos, chacune
 * portant le crédit de son partenaire. Photos invalides ignorées silencieusement.
 */
export const getCollaborationSlides = unstable_cache(
  async (): Promise<CollaborationSlide[]> => {
    const collaborations = await prisma.collaboration.findMany({
      where: { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    });

    const slides: CollaborationSlide[] = [];
    for (const collab of collaborations) {
      const parsed = photosSchema.safeParse(collab.photos);
      if (!parsed.success) continue;
      for (const photo of parsed.data) {
        slides.push({
          ...photo,
          partnerName: collab.partnerName,
          partnerUrl: collab.partnerUrl,
        });
      }
    }
    return slides;
  },
  ["collaborations:slides"],
  { tags: [COLLABORATIONS_TAG], revalidate: 300 },
);
