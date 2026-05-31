import { CollaborationForm } from "@/components/admin/collaborations/collaboration-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { type CollaborationInput } from "@/server/admin/collaborations.schema";

const DEFAULT_COLLABORATION: CollaborationInput = {
  partnerName: "",
  partnerUrl: null,
  photos: [],
  isPublished: true,
  displayOrder: 0,
};

export default function NewCollaborationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Partenaires · Nouvelle collaboration"
        title="Ajouter une collaboration"
        lede="Importez les photos d'une collaboration et créditez le partenaire."
      />
      <CollaborationForm mode="create" initial={DEFAULT_COLLABORATION} uploadFolder="new" />
    </>
  );
}
