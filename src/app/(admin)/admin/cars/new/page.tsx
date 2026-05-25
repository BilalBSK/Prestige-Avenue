import { CarForm } from "@/components/admin/cars/car-form";
import { PageHeader } from "@/components/admin/ui/page-header";
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
  weekendPackagePrice: null,
  weekendPackageIncludedKm: null,
  depositAmount: 0,
  minDriverAge: 21,
  minLicenseYears: 2,
  description: "",
  highlights: [],
  features: [],
  mainImage: "",
  galleryImages: [],
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
