import { buttonVariants } from "@/components/admin/ui/button-variants";
import { CollaborationsList } from "@/components/admin/collaborations/collaborations-list";
import type { CollaborationRow } from "@/components/admin/collaborations/collaborations-list-row";
import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
import { listCollaborationsForAdmin } from "@/server/admin/collaborations.queries";
import { collaborationPhotoSchema } from "@/server/admin/collaborations.schema";
import Link from "next/link";
import { z } from "zod";

const photosSchema = z.array(collaborationPhotoSchema);

export default async function AdminCollaborationsPage() {
  const collaborations = await listCollaborationsForAdmin();

  const rows: CollaborationRow[] = collaborations.map((c) => {
    const parsed = photosSchema.safeParse(c.photos);
    const photos = parsed.success ? parsed.data : [];
    return {
      id: c.id,
      partnerName: c.partnerName,
      partnerUrl: c.partnerUrl,
      coverImage: photos[0]?.url ?? null,
      photoCount: photos.length,
      isPublished: c.isPublished,
    };
  });

  const publishedCount = rows.filter((r) => r.isPublished).length;
  const totalPhotos = rows.reduce((sum, r) => sum + r.photoCount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Partenaires"
        title="Collaborations"
        lede="Mettez en avant vos collaborations sur la page Partenaires. Les photos publiées alimentent le carrousel."
        meta={
          <>
            <PageMetaItem label="Total" value={rows.length} />
            <PageMetaItem label="Publiées" value={publishedCount} />
            <PageMetaItem label="Photos" value={totalPhotos} />
          </>
        }
        actions={
          <Link
            href="/admin/collaborations/new"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            Ajouter une collaboration
          </Link>
        }
      />
      <CollaborationsList collaborations={rows} />
    </>
  );
}
