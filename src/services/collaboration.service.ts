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
    let collaborations;
    try {
      collaborations = await prisma.collaboration.findMany({
        where: { isPublished: true },
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      });
    } catch (error) {
      // Never let a DB hiccup (e.g. the Collaboration migration not yet applied
      // on a fresh environment) take down the whole /partenaires render. The
      // carousel is non-essential decoration — degrade to "no slides" and log,
      // so the rest of the page still serves. Mirrors the resilience added to
      // the /availability route.
      console.error("[collaboration.service] findMany failed, hiding carousel:", error);
      return [];
    }

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
