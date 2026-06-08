-- Week-end packages: split the single legacy package into 48h and 72h tiers.
--
-- The legacy `weekendPackagePrice` / `weekendPackageIncludedKm` columns already
-- represented the 72h package (Friday → Monday), so we RENAME them to the new
-- `*72h` names — preserving every existing value — and ADD fresh nullable
-- columns for the new 48h package (Friday → Sunday OR Saturday → Monday).

ALTER TABLE "Car" RENAME COLUMN "weekendPackagePrice" TO "weekendPackagePrice72h";
ALTER TABLE "Car" RENAME COLUMN "weekendPackageIncludedKm" TO "weekendPackageIncludedKm72h";

ALTER TABLE "Car" ADD COLUMN "weekendPackagePrice48h" DECIMAL(10,2);
ALTER TABLE "Car" ADD COLUMN "weekendPackageIncludedKm48h" INTEGER;
