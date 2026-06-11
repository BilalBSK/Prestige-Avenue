-- Conditions de location libres, pilotées par l'admin, en remplacement des
-- anciens champs rigides minDriverAge / minLicenseYears.

-- AlterTable : nouvelle colonne JSON.
ALTER TABLE "Car" ADD COLUMN "rentalConditions" JSONB NOT NULL DEFAULT '[]';

-- Backfill : on reconstruit pour chaque véhicule des conditions équivalentes à
-- l'ancien affichage (âge minimum + ancienneté du permis), pour ne rien perdre.
UPDATE "Car" SET "rentalConditions" = jsonb_build_array(
  jsonb_build_object(
    'label', 'Âge minimum',
    'value', "minDriverAge"::text || ' ans',
    'hint', 'Âge requis du conducteur principal.'
  ),
  jsonb_build_object(
    'label', 'Permis de conduire',
    'value', CASE
      WHEN "minLicenseYears" <= 0 THEN 'Toutes anciennetés'
      WHEN "minLicenseYears" = 1 THEN 'Depuis 1 an'
      ELSE 'Depuis ' || "minLicenseYears"::text || ' ans'
    END,
    'hint', 'Permis en cours de validité, pièce d''identité demandée.'
  )
);

-- DropColumn : les champs rigides sont désormais couverts par rentalConditions.
ALTER TABLE "Car" DROP COLUMN "minDriverAge";
ALTER TABLE "Car" DROP COLUMN "minLicenseYears";
