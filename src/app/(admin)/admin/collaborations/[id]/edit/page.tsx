import { CollaborationForm } from "@/components/admin/collaborations/collaboration-form";
import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
import { getCollaborationForAdmin } from "@/server/admin/collaborations.queries";
import {
  collaborationPhotoSchema,
  type CollaborationInput,
} from "@/server/admin/collaborations.schema";
import { notFound } from "next/navigation";
import { z } from "zod";

const photosSchema = z.array(collaborationPhotoSchema);

function toFormValues(
  collab: NonNullable<Awaited<ReturnType<typeof getCollaborationForAdmin>>>,
): CollaborationInput {
  const parsed = photosSchema.safeParse(collab.photos);
  return {
    partnerName: collab.partnerName,
    partnerUrl: collab.partnerUrl,
    photos: parsed.success ? parsed.data : [],
    isPublished: collab.isPublished,
    displayOrder: collab.displayOrder,
  };
}

export default async function EditCollaborationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collab = await getCollaborationForAdmin(id);
  if (!collab) notFound();

  const values = toFormValues(collab);

  return (
    <>
      <PageHeader
        eyebrow="Partenaires · Édition"
        title={collab.partnerName}
        lede="Les modifications sont publiées immédiatement."
        meta={
          <>
            <PageMetaItem label="Photos" value={values.photos.length} />
            <PageMetaItem label="Statut" value={collab.isPublished ? "Publiée" : "Masquée"} />
          </>
        }
      />
      <CollaborationForm
        mode="edit"
        collaborationId={collab.id}
        initial={values}
        uploadFolder={collab.id}
      />
    </>
  );
}
