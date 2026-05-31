"use server";

import { requireAdminSessionOrRedirect } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { COLLABORATIONS_TAG } from "@/services/collaboration.service";
import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { collaborationFormSchema, type CollaborationInput } from "./collaborations.schema";

function toPrismaData(input: CollaborationInput) {
  return {
    partnerName: input.partnerName,
    partnerUrl: input.partnerUrl,
    photos: input.photos as unknown as Prisma.InputJsonValue,
    isPublished: input.isPublished,
    displayOrder: input.displayOrder,
  };
}

function revalidateCollaborationSurfaces() {
  revalidateTag(COLLABORATIONS_TAG);
  revalidatePath("/partenaires");
  revalidatePath("/admin/collaborations");
}

export async function createCollaboration(input: CollaborationInput): Promise<{ id: string }> {
  await requireAdminSessionOrRedirect();
  const parsed = collaborationFormSchema.parse(input);

  const created = await prisma.collaboration.create({ data: toPrismaData(parsed) });
  revalidateCollaborationSurfaces();
  return { id: created.id };
}

export async function updateCollaboration(id: string, input: CollaborationInput): Promise<void> {
  await requireAdminSessionOrRedirect();
  const parsed = collaborationFormSchema.parse(input);

  await prisma.collaboration.update({ where: { id }, data: toPrismaData(parsed) });
  revalidateCollaborationSurfaces();
}

export async function deleteCollaboration(id: string): Promise<void> {
  await requireAdminSessionOrRedirect();
  await prisma.collaboration.delete({ where: { id } });
  revalidateCollaborationSurfaces();
}

export async function toggleCollaborationPublished(id: string): Promise<void> {
  await requireAdminSessionOrRedirect();
  const collab = await prisma.collaboration.findUnique({
    where: { id },
    select: { isPublished: true },
  });
  if (!collab) throw new Error("Collaboration introuvable.");
  await prisma.collaboration.update({
    where: { id },
    data: { isPublished: !collab.isPublished },
  });
  revalidateCollaborationSurfaces();
}

export async function reorderCollaborations(orderedIds: string[]): Promise<void> {
  await requireAdminSessionOrRedirect();
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.collaboration.update({ where: { id }, data: { displayOrder: index + 1 } }),
    ),
  );
  revalidateCollaborationSurfaces();
}
