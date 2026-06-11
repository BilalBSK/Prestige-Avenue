import { CarForm } from "@/components/admin/cars/car-form";
import { PageHeader } from "@/components/admin/ui/page-header";
import { RENTAL_CONDITION_PRESETS } from "@/lib/cars/conditions";
import { type CarInput } from "@/server/admin/cars.schema";
import { CarCategory, CarStatus, FuelType, Transmission } from "@prisma/client";

const DEFAULT_CAR: CarInput = {
  brand: "",
  model: "",
  trim: null,
  year: 2025,
  slug: "",
  category: CarCategory.CITADINE,
  shortTagline: null,
  power: 100,
  transmission: Transmission.AUTOMATIC,
  fuelType: FuelType.PETROL,
  seats: 5,
  doors: 5,
  pricePerDay: 0,
  pricePerKm: null,
  includedKmPerDay: null,
  weekendPackagePrice48h: null,
  weekendPackageIncludedKm48h: null,
  weekendPackagePrice72h: null,
  weekendPackageIncludedKm72h: null,
  depositAmount: 0,
  // Conditions de base pré-remplies : l'admin ajuste, supprime ou complète.
  rentalConditions: RENTAL_CONDITION_PRESETS.slice(0, 3).map((c) => ({ ...c })),
  description: "",
  highlights: [],
  features: [],
  mainImage: "",
  highlightImage: null,
  galleryImages: [],
  galleryShots: [],
  videoUrl: null,
  status: CarStatus.AVAILABLE,
  isFeatured: false,
  displayOrder: 0,
};

export default function NewCarPage() {
  return (
    <>
      <PageHeader
        eyebrow="Catalogue · Nouveau véhicule"
        title="Ajouter un véhicule"
        lede="Renseignez les informations du véhicule pour le publier au catalogue."
      />
      <CarForm mode="create" initial={DEFAULT_CAR} uploadFolder="new" />
    </>
  );
}
