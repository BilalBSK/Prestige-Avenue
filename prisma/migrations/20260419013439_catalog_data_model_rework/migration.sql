-- Purge des voitures de démo avant d'ajouter des colonnes NOT NULL.
-- Les bookings et blockedDates associés sont supprimés en cascade (carId ON DELETE).
-- Justification : les 5 voitures actuelles n'ont ni slug, ni category, ni power —
-- les back-filler demanderait des devinettes. On recharge via `npm run seed` après migration.
DELETE FROM "BlockedDate";
DELETE FROM "Booking";
DELETE FROM "Car";

-- CreateEnum
CREATE TYPE "CarCategory" AS ENUM ('CITADINE', 'COMPACTE', 'BERLINE', 'SUV', 'COUPE', 'CABRIOLET', 'SPORTIVE');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'PLUG_IN_HYBRID', 'ELECTRIC');

-- AlterTable: Car
ALTER TABLE "Car" RENAME COLUMN "weekendPrice" TO "weekendPackagePrice";

ALTER TABLE "Car"
  ADD COLUMN "slug"                      TEXT        NOT NULL,
  ADD COLUMN "trim"                      TEXT,
  ADD COLUMN "category"                  "CarCategory" NOT NULL,
  ADD COLUMN "power"                     INTEGER     NOT NULL,
  ADD COLUMN "transmission"              "Transmission" NOT NULL,
  ADD COLUMN "fuelType"                  "FuelType"  NOT NULL,
  ADD COLUMN "seats"                     INTEGER     NOT NULL DEFAULT 5,
  ADD COLUMN "doors"                     INTEGER     NOT NULL DEFAULT 5,
  ADD COLUMN "pricePerKm"                DECIMAL(10, 2),
  ADD COLUMN "includedKmPerDay"          INTEGER,
  ADD COLUMN "weekendPackageIncludedKm"  INTEGER,
  ADD COLUMN "minDriverAge"              INTEGER     NOT NULL DEFAULT 21,
  ADD COLUMN "minLicenseYears"           INTEGER     NOT NULL DEFAULT 2,
  ADD COLUMN "shortTagline"              TEXT,
  ADD COLUMN "highlights"                TEXT[],
  ADD COLUMN "features"                  JSONB       NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN "isFeatured"                BOOLEAN     NOT NULL DEFAULT false,
  ADD COLUMN "displayOrder"              INTEGER     NOT NULL DEFAULT 0,
  ADD COLUMN "updatedAt"                 TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Car_slug_key" ON "Car"("slug");
CREATE INDEX "Car_isFeatured_displayOrder_idx" ON "Car"("isFeatured", "displayOrder");
CREATE INDEX "Car_category_status_idx" ON "Car"("category", "status");
