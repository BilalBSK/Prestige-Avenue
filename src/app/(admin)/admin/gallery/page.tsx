import { PageHeader, PageMetaItem } from "@/components/admin/ui/page-header";
import {
  GalleryManager,
  type GalleryItemRow,
} from "@/components/admin/gallery/gallery-manager";
import { listGalleryItemsForAdmin } from "@/server/admin/home-gallery.queries";

export default async function AdminGalleryPage() {
  const items = await listGalleryItemsForAdmin();

  const rows: GalleryItemRow[] = items.map((item) => ({
    id: item.id,
    mediaType: item.mediaType,
    src: item.src,
    poster: item.poster,
    alt: item.alt,
    ratio: item.ratio,
    isPublished: item.isPublished,
  }));

  const publishedCount = rows.filter((r) => r.isPublished).length;
  const videoCount = rows.filter((r) => r.mediaType === "VIDEO").length;

  return (
    <>
      <PageHeader
        eyebrow="Accueil"
        title="Galerie « Notre univers »"
        lede="Composez la galerie de la page d'accueil : importez images et vidéos, choisissez leur format et leur ordre. Seules les tuiles publiées apparaissent en ligne."
        meta={
          <>
            <PageMetaItem label="Tuiles" value={rows.length} />
            <PageMetaItem label="Publiées" value={publishedCount} />
            <PageMetaItem label="Vidéos" value={videoCount} />
          </>
        }
      />
      <GalleryManager initialItems={rows} />
    </>
  );
}
