# Refonte du catalogue — modèle de données — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer le catalogue de démo par les 3 vraies voitures de Prestige Avenue, avec un modèle de données Prisma pro et une logique de prix week-end forfaitaire.

**Architecture:** Migration Prisma non-destructive (rename + add columns). La logique de prix week-end bascule de "tarif/nuit × jours de week-end" vers "forfait 72h si Ven→Lun, sinon tarif journalier". Le seed nettoie les 5 voitures de démo et insère les 3 vraies voitures. Les pages publiques affichent les nouveaux champs (puissance, highlights, features, conditions).

**Tech Stack:** Next.js 15 App Router, React 19, Prisma 6 / PostgreSQL, Zod 4, TypeScript, Tailwind CSS v4.

**Note sur les tests :** le projet n'a **pas de framework de tests** (voir `CLAUDE.md`). La TDD classique n'est pas applicable ici. À la place, chaque tâche se termine par des **vérifications manuelles explicites** : `npm run build`, `npm run lint`, scripts Node ad-hoc avec `tsx`, et vérifications via `prisma studio` / `dev server`. Ne pas ajouter de dépendance de test dans ce plan — c'est hors scope.

---

## Fichiers impactés

| Fichier | Créé / Modifié | Rôle |
|---|---|---|
| `prisma/schema.prisma` | Modifié | Nouvelles enums, champs Car, rename `weekendPrice` |
| `prisma/migrations/<ts>_catalog_data_model_rework/migration.sql` | Créé | Migration SQL non-destructive |
| `prisma/seed.js` | Modifié | Reset flotte démo + 3 vraies voitures |
| `src/lib/booking.ts` | Modifié | `calculateTotalPrice` : forfait week-end 72h |
| `src/services/booking.service.ts` | Modifié | `select` du champ `weekendPackagePrice` au lieu de `weekendPrice` |
| `src/components/booking/booking-form.tsx` | Modifié | Prop + calcul miroir forfait |
| `src/app/cars/[id]/page.tsx` | Modifié | Affiche specs, highlights, features, conditions |
| `src/components/cars/car-card.tsx` | Modifié | Affiche `shortTagline` et `power` |
| `src/services/car.service.ts` | Modifié | Tri `displayOrder` puis `pricePerDay` |
| `src/app/api/admin/cars/route.ts` | Modifié | Zod élargi (nouveaux champs) |
| `src/app/api/admin/cars/[id]/route.ts` | Modifié | Zod élargi (update) |
| `src/components/admin/create-car-form.tsx` | Modifié | Compat minimale : rename champ, laisser le reste en place |
| `src/app/cars/page.tsx` | Non modifié | Continue à utiliser `CarCard` |

---

## Task 1 : Préparer la migration Prisma — nouvelles enums et champs

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1.1 : Ajouter les 3 nouvelles enums dans `prisma/schema.prisma`**

Placer sous `enum PaymentStatus` (ligne ~33) :

```prisma
enum CarCategory {
  CITADINE
  COMPACTE
  BERLINE
  SUV
  COUPE
  CABRIOLET
  SPORTIVE
}

enum Transmission {
  MANUAL
  AUTOMATIC
}

enum FuelType {
  PETROL
  DIESEL
  HYBRID
  PLUG_IN_HYBRID
  ELECTRIC
}
```

- [ ] **Step 1.2 : Remplacer entièrement le modèle `Car` dans `prisma/schema.prisma`**

Remplacer tout le bloc `model Car { ... }` (lignes 48-67) par :

```prisma
model Car {
  id                         String       @id @default(cuid())
  slug                       String       @unique
  brand                      String
  model                      String
  trim                       String?
  year                       Int
  category                   CarCategory

  power                      Int
  transmission               Transmission
  fuelType                   FuelType
  seats                      Int          @default(5)
  doors                      Int          @default(5)

  pricePerDay                Decimal      @db.Decimal(10, 2)
  pricePerKm                 Decimal?     @db.Decimal(10, 2)
  includedKmPerDay           Int?
  weekendPackagePrice        Decimal?     @db.Decimal(10, 2)
  weekendPackageIncludedKm   Int?
  depositAmount              Decimal      @db.Decimal(10, 2)

  minDriverAge               Int          @default(21)
  minLicenseYears            Int          @default(2)

  shortTagline               String?
  description                String
  highlights                 String[]
  features                   Json         @default("[]")

  mainImage                  String
  galleryImages              String[]
  videoUrl                   String?

  status                     CarStatus    @default(AVAILABLE)
  isFeatured                 Boolean      @default(false)
  displayOrder               Int          @default(0)
  createdAt                  DateTime     @default(now())
  updatedAt                  DateTime     @updatedAt

  bookings                   Booking[]
  blockedDates               BlockedDate[]

  @@index([status])
  @@index([isFeatured, displayOrder])
  @@index([category, status])
  @@index([createdAt])
}
```

- [ ] **Step 1.3 : Valider le schéma**

Run:
```
npx prisma validate
```
Expected: `The schema at ... is valid`.

- [ ] **Step 1.4 : Commit**

```
git add prisma/schema.prisma
git commit -m "feat(schema): enrich Car model with pro rental fields"
```

---

## Task 2 : Générer et amender la migration SQL

Problème : `prisma migrate dev` ne sait pas back-filler `slug`, `category`, `power`, `transmission`, `fuelType`, `description`, `updatedAt` avec des valeurs valides pour les 5 voitures de démo existantes. Solution : purger la table `Car` **avant** d'appliquer les `NOT NULL`, puis laisser le seed recréer les 3 vraies voitures.

**Files:**
- Create: `prisma/migrations/<timestamp>_catalog_data_model_rework/migration.sql`

- [ ] **Step 2.1 : Générer le squelette de migration sans l'appliquer**

Run:
```
npx prisma migrate dev --name catalog_data_model_rework --create-only
```
Expected: un dossier `prisma/migrations/<timestamp>_catalog_data_model_rework/` contenant un `migration.sql`. Noter le chemin exact.

- [ ] **Step 2.2 : Remplacer le contenu de `migration.sql` par la version non-destructive**

Remplacer l'intégralité du fichier `migration.sql` nouvellement créé par :

```sql
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
```

Attention : le vrai `migration.sql` généré par Prisma peut contenir des instructions différentes (notamment pour le rename, que Prisma fait souvent en DROP + ADD). Il faut **impérativement** remplacer par la version ci-dessus qui :
- vide les données **avant** d'ajouter les `NOT NULL`,
- **renomme** `weekendPrice` au lieu de dropper la colonne (cohérent avec le spec).

- [ ] **Step 2.3 : Appliquer la migration**

Run:
```
npx prisma migrate dev
```
Expected: la migration est marquée comme appliquée, Prisma Client est régénéré. Pas d'erreur.

- [ ] **Step 2.4 : Commit**

```
git add prisma/migrations/
git commit -m "feat(db): migrate Car table to pro rental data model"
```

---

## Task 3 : Mettre à jour le seed avec les 3 vraies voitures

**Files:**
- Modify: `prisma/seed.js`

- [ ] **Step 3.1 : Remplacer le tableau `cars` et les références en aval dans `prisma/seed.js`**

Dans `main()`, remplacer le bloc `const cars = await Promise.all([ ensureCar({...}), ensureCar({...}), ... ]);` (lignes 120-203) par :

```js
  // Nettoyage des données de démo avant d'insérer la vraie flotte.
  await prisma.blockedDate.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.car.deleteMany({});

  const clio6 = await prisma.car.create({
    data: {
      slug: "renault-clio-6-alpine",
      brand: "Renault",
      model: "Clio 6",
      trim: "Esprit Alpine",
      year: 2025,
      category: "CITADINE",
      power: 156,
      transmission: "AUTOMATIC",
      fuelType: "HYBRID",
      seats: 5,
      doors: 5,
      pricePerDay: 34.99,
      pricePerKm: 0.3,
      includedKmPerDay: 200,
      weekendPackagePrice: 320.0,
      weekendPackageIncludedKm: 600,
      depositAmount: 1500.0,
      minDriverAge: 21,
      minLicenseYears: 2,
      shortTagline:
        "La citadine statutaire : lignes élégantes et technologies embarquées.",
      description:
        "La Renault Clio affirme une vision plus statutaire de la citadine : lignes élégantes, technologies embarquées intuitives et finitions soignées s'unissent pour offrir un confort haut de gamme et une présence qui dépasse largement son format compact.",
      highlights: [
        "156 ch",
        "29 aides à la conduite",
        "Profil coupé hybride",
        "Finitions Esprit Alpine",
      ],
      features: [
        {
          title: "Sécurité augmentée",
          body: "Nouvelle Clio propose 29 systèmes avancés d'aide à la conduite qui rendent votre expérience au volant plus sûre. En complément, les dispositifs safety score et safety coach fournissent des conseils personnalisés pour optimiser votre conduite.",
        },
        {
          title: "Lignes sportives",
          body: "Le profil « coupé » de la citadine hybride réinvente les codes du segment. Feux traités comme des éléments esthétiques à part entière, découpe des vitres et becquet lui confèrent une silhouette sportive et une énergie latine.",
        },
      ],
      mainImage:
        "https://images.unsplash.com/photo-1606152421802-db97b2c7a11f?auto=format&fit=crop&w=1600&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1600&q=80",
      ],
      videoUrl: null,
      status: "AVAILABLE",
      isFeatured: true,
      displayOrder: 1,
    },
  });

  const audiA3 = await prisma.car.create({
    data: {
      slug: "audi-a3-sportback-2025",
      brand: "Audi",
      model: "A3 Sportback",
      trim: "TFSI e S line",
      year: 2025,
      category: "COMPACTE",
      power: 272,
      transmission: "AUTOMATIC",
      fuelType: "PLUG_IN_HYBRID",
      seats: 5,
      doors: 5,
      pricePerDay: 39.99,
      pricePerKm: 0.3,
      includedKmPerDay: 200,
      weekendPackagePrice: 490.0,
      weekendPackageIncludedKm: 600,
      depositAmount: 2500.0,
      minDriverAge: 23,
      minLicenseYears: 3,
      shortTagline:
        "L'hybride rechargeable premium, 272 ch et jusqu'à 142 km en électrique.",
      description:
        "Prenez le volant de la Nouvelle Audi A3 Sportback TFSI e et entrez dans une nouvelle ère de performance. Jusqu'à 142 km d'autonomie en électrique, une technologie de pointe et un design athlétique qui attire tous les regards. L'hybride rechargeable allie puissance, efficience et réduction des émissions pour transformer chacun de vos trajets en expérience premium.",
      highlights: [
        "272 ch",
        "142 km d'autonomie électrique",
        "Cockpit digital",
        "Hybride rechargeable",
      ],
      features: [
        {
          title: "Une expérience de conduite intelligente",
          body: "L'intérieur de l'Audi A3 Sportback propose un cockpit digital orienté vers le conducteur, des écrans haute définition, des matériaux soigneusement travaillés et un éclairage d'ambiance élégant qui rendent chaque trajet aussi confortable que technologique.",
        },
        {
          title: "La référence des compactes premium",
          body: "L'Audi A3 Sportback combine un design sportif affirmé, des technologies de dernière génération et un intérieur raffiné pour offrir une expérience de conduite aussi dynamique qu'élégante, parfaite pour le quotidien comme pour les grands trajets.",
        },
      ],
      mainImage:
        "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=80",
      ],
      videoUrl: null,
      status: "AVAILABLE",
      isFeatured: true,
      displayOrder: 2,
    },
  });

  const clio5 = await prisma.car.create({
    data: {
      slug: "renault-clio-5-alpine",
      brand: "Renault",
      model: "Clio 5",
      trim: "Esprit Alpine",
      year: 2024,
      category: "CITADINE",
      power: 145,
      transmission: "AUTOMATIC",
      fuelType: "HYBRID",
      seats: 5,
      doors: 5,
      pricePerDay: 29.99,
      pricePerKm: 0.3,
      includedKmPerDay: 200,
      weekendPackagePrice: 280.0,
      weekendPackageIncludedKm: 600,
      depositAmount: 1500.0,
      minDriverAge: 21,
      minLicenseYears: 2,
      shortTagline:
        "Le sport chic à portée de main, jusqu'à 80% électrique en ville.",
      description:
        "La Renault Clio 5 finition Alpine ne passe jamais inaperçue : look sportif, détails exclusifs et ambiance moderne à bord en font le choix parfait pour ceux qui veulent se démarquer avec style, sans compromis sur le confort.",
      highlights: [
        "145 ch",
        "80% conduite électrique en ville",
        "Jantes Alpine 17\"",
        "Finitions bleu/blanc/rouge",
      ],
      features: [
        {
          title: "Version Esprit Alpine",
          body: "Un style incisif et stimulant : flancs sculptés, calandre élargie gris chromée, éclairage full LED en forme de demi losange à l'avant. La sportivité s'exprime dans la version Esprit Alpine. Jantes la flèche 17'', badge spécifique et lame F1 gris schiste mat emblématique pour l'extérieur. À l'intérieur, selleries parées du logo Alpine brodé, de surpiqûres et écusson spécifiques. Les coutures bleu/blanc/rouge du volant font référence à l'ADN Esprit Alpine.",
        },
        {
          title: "Le sport chic à portée de main",
          body: "La Renault Clio 5 en version Alpine combine caractère, élégance et technologies modernes pour offrir une citadine qui attire tous les regards et transforme chaque trajet en moment privilégié.",
        },
      ],
      mainImage:
        "https://images.unsplash.com/photo-1617813480220-92c66a28fca6?auto=format&fit=crop&w=1600&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1627454822464-d3cca3a03f1b?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?auto=format&fit=crop&w=1600&q=80",
      ],
      videoUrl: null,
      status: "AVAILABLE",
      isFeatured: true,
      displayOrder: 3,
    },
  });

  const cars = [clio6, audiA3, clio5];
```

- [ ] **Step 3.2 : Adapter les références aval dans `main()`**

Les bookings de démo (lignes 205-268) utilisent les variables `audiA3`, `mercedes`, `bmw`. Supprimer entièrement ce bloc (depuis `const audiA3 = cars.find(...)` jusqu'à la fin du dernier `upsertBooking` inclus — juste avant le `console.log`). Remplacer par :

```js
  // Pas de bookings de démo : la flotte doit refléter uniquement les voitures réelles.
  void cars;
```

- [ ] **Step 3.3 : Supprimer la fonction `upsertBooking` devenue inutile**

Dans `prisma/seed.js`, supprimer la fonction `upsertBooking` (lignes ~55-93) et l'import `BookingStatus, PaymentStatus` s'ils ne sont plus utilisés. Remplacer la ligne d'import (ligne 1) par :

```js
const { PrismaClient, Role } = require("@prisma/client");
```

- [ ] **Step 3.4 : Lancer le seed**

Run:
```
npm run seed
```
Expected: sortie `Seed done: ...` sans erreur.

- [ ] **Step 3.5 : Vérifier le résultat via un script rapide**

Run:
```
node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.car.findMany({orderBy:{displayOrder:'asc'}}).then(c=>{console.log(c.map(x=>x.brand+' '+x.model+' ('+x.power+'ch)'))}).finally(()=>p.$disconnect())"
```
Expected: `[ 'Renault Clio 6 (156ch)', 'Audi A3 Sportback (272ch)', 'Renault Clio 5 (145ch)' ]`.

- [ ] **Step 3.6 : Commit**

```
git add prisma/seed.js
git commit -m "feat(seed): replace demo fleet with real Prestige Avenue cars"
```

---

## Task 4 : Logique de prix week-end forfaitaire

**Files:**
- Modify: `src/lib/booking.ts`

- [ ] **Step 4.1 : Remplacer `calculateTotalPrice` dans `src/lib/booking.ts`**

Localiser la fonction `calculateTotalPrice` (lignes 48-60) et la remplacer par :

```ts
export function calculateTotalPrice(
  car: Pick<Car, "pricePerDay" | "weekendPackagePrice">,
  startDate: Date,
  endDate: Date,
): number {
  const rentalDays = calculateRentalDays(startDate, endDate);

  if (
    rentalDays === 3 &&
    isFriday(startDate) &&
    isMonday(endDate) &&
    car.weekendPackagePrice
  ) {
    return Number(Number(car.weekendPackagePrice).toFixed(2));
  }

  return Number((rentalDays * Number(car.pricePerDay)).toFixed(2));
}
```

Note : la règle métier (`validateBusinessBookingRules`) garantit qu'aucune réservation ne contient de jour de week-end **hors** du forfait Ven→Lun. Cette fonction peut donc rester simple : soit forfait 72h, soit `pricePerDay × jours`.

- [ ] **Step 4.2 : Supprimer la fonction `containsWeekendDays` devenue inutile**

Dans `src/lib/booking.ts`, supprimer la fonction `containsWeekendDays` (lignes 68-72) ET son usage dans `validateBusinessBookingRules` (lignes 102-109). Remplacer ce dernier bloc par une vérification équivalente inline :

```ts
  const lastChargedDay = addDays(endDate, -1);
  const days = eachDayOfInterval({ start: startDate, end: lastChargedDay });
  const hasWeekendDay = days.some((day) => getISODay(day) >= 5);

  if (hasWeekendDay) {
    const isFullWeekendOnly = isFriday(startDate) && isMonday(endDate) && rentalDays === 3;
    if (!isFullWeekendOnly) {
      throw new Error(
        "Toute reservation incluant vendredi, samedi ou dimanche doit etre faite du vendredi au lundi.",
      );
    }
  }
```

- [ ] **Step 4.3 : Nettoyer les imports `isWeekend`**

`isWeekend` n'est plus utilisé. Retirer `isWeekend,` de la liste d'imports `date-fns` en haut du fichier.

- [ ] **Step 4.4 : Vérifier avec un script ad-hoc**

Run:
```
npx tsx --eval "import {calculateTotalPrice} from './src/lib/booking.ts'; const car={pricePerDay:34.99, weekendPackagePrice:320}; console.log('Weekend Fri->Mon:', calculateTotalPrice(car, new Date('2026-05-01'), new Date('2026-05-04'))); console.log('Weekday 3 nights:', calculateTotalPrice(car, new Date('2026-05-04'), new Date('2026-05-07')));"
```
Expected:
```
Weekend Fri->Mon: 320
Weekday 3 nights: 104.97
```

Note : `2026-05-01` est bien un vendredi, `2026-05-04` un lundi.

- [ ] **Step 4.5 : Commit**

```
git add src/lib/booking.ts
git commit -m "feat(booking): use weekend package price for Fri-Mon bookings"
```

---

## Task 5 : Mettre à jour le service booking et les types consommés

**Files:**
- Modify: `src/services/booking.service.ts`

- [ ] **Step 5.1 : Renommer `weekendPrice` → `weekendPackagePrice` dans le `select`**

Dans `src/services/booking.service.ts`, localiser le `select` autour de la ligne 130 :

Remplacer :
```ts
      select: {
        id: true,
        brand: true,
        model: true,
        status: true,
        pricePerDay: true,
        weekendPrice: true,
        depositAmount: true,
      },
```

Par :
```ts
      select: {
        id: true,
        brand: true,
        model: true,
        status: true,
        pricePerDay: true,
        weekendPackagePrice: true,
        depositAmount: true,
      },
```

- [ ] **Step 5.2 : Vérifier que `npm run build` passe**

Run:
```
npm run build
```
Expected: `Compiled successfully` sans erreur TypeScript.

- [ ] **Step 5.3 : Commit**

```
git add src/services/booking.service.ts
git commit -m "refactor(booking-service): select weekendPackagePrice for pricing"
```

---

## Task 6 : Aligner le calcul côté client du `BookingForm`

**Files:**
- Modify: `src/components/booking/booking-form.tsx`

- [ ] **Step 6.1 : Renommer la prop et ajuster l'interface**

Dans `src/components/booking/booking-form.tsx`, remplacer l'interface `BookingFormProps` (lignes 26-31) par :

```ts
interface BookingFormProps {
  carId: string;
  pricePerDay: number;
  weekendPackagePrice: number | null;
  depositAmount: number;
  pricePerKm: number | null;
  includedKmPerDay: number | null;
}
```

- [ ] **Step 6.2 : Remplacer `calculateEstimate` par la logique forfait**

Remplacer entièrement la fonction `calculateEstimate` (lignes 33-61) par :

```ts
function calculateEstimate(
  startDateValue: string | undefined,
  endDateValue: string | undefined,
  pricePerDay: number,
  weekendPackagePrice: number | null,
) {
  if (!startDateValue || !endDateValue) {
    return 0;
  }

  const startDate = new Date(startDateValue);
  const endDate = new Date(endDateValue);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate <= startDate
  ) {
    return 0;
  }

  const days = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const isWeekendPackage =
    days === 3 &&
    startDate.getDay() === 5 &&
    endDate.getDay() === 1 &&
    weekendPackagePrice !== null;

  if (isWeekendPackage) {
    return Number(weekendPackagePrice!.toFixed(2));
  }

  return Number((days * pricePerDay).toFixed(2));
}
```

- [ ] **Step 6.3 : Nettoyer les imports inutilisés**

Dans la ligne d'import `date-fns` (ligne 5), retirer `eachDayOfInterval,` et `isWeekend,`. Résultat attendu :

```ts
import { addDays, addMonths, format } from "date-fns";
```

- [ ] **Step 6.4 : Adapter la signature déstructurée et les `useMemo`**

Dans le corps du composant :

1. Remplacer `weekendPrice,` par `weekendPackagePrice,` dans la déstructuration `function BookingForm({...})` (ligne ~68).
2. Remplacer l'appel `calculateEstimate(startDate, endDate, pricePerDay, weekendPrice)` par `calculateEstimate(startDate, endDate, pricePerDay, weekendPackagePrice)`.
3. Remplacer la dépendance `[startDate, endDate, pricePerDay, weekendPrice]` du `useMemo` par `[startDate, endDate, pricePerDay, weekendPackagePrice]`.

- [ ] **Step 6.5 : Ajouter l'affichage kilométrage informatif**

Dans le bloc récap `<div className="rounded-xl border border-zinc-800/90 bg-black/30 p-4 text-sm text-zinc-200">` (ligne ~237), ajouter juste après la ligne `<p className="text-xs text-zinc-500">Caution vehicule: ...` :

```tsx
        {includedKmPerDay !== null && pricePerKm !== null && (
          <p className="text-xs text-zinc-500">
            Kilométrage inclus : {includedKmPerDay} km/jour. Au-delà : {pricePerKm.toFixed(2)} €/km (facturé au retour si dépassement).
          </p>
        )}
```

- [ ] **Step 6.6 : Commit**

```
git add src/components/booking/booking-form.tsx
git commit -m "feat(booking-form): mirror weekend package pricing and show km policy"
```

---

## Task 7 : Enrichir la page détail voiture

**Files:**
- Modify: `src/app/cars/[id]/page.tsx`

- [ ] **Step 7.1 : Mettre à jour l'appel `BookingForm`**

Localiser le composant `<BookingForm>` à la fin du fichier (lignes 101-106) et le remplacer par :

```tsx
        <BookingForm
          carId={car.id}
          pricePerDay={Number(car.pricePerDay)}
          weekendPackagePrice={car.weekendPackagePrice ? Number(car.weekendPackagePrice) : null}
          depositAmount={Number(car.depositAmount)}
          pricePerKm={car.pricePerKm ? Number(car.pricePerKm) : null}
          includedKmPerDay={car.includedKmPerDay ?? null}
        />
```

- [ ] **Step 7.2 : Afficher `shortTagline` sous le titre**

Remplacer le bloc `<AnimatedText text={car.description} ... />` (lignes 37-43) par :

```tsx
        {car.shortTagline && (
          <AnimatedText
            text={car.shortTagline}
            as="p"
            animation="blur-reveal"
            delay={400}
            className="max-w-3xl text-lg text-zinc-300"
          />
        )}
        <AnimatedText
          text={car.description}
          as="p"
          animation="blur-reveal"
          delay={500}
          className="max-w-3xl text-zinc-400"
        />
```

- [ ] **Step 7.3 : Ajouter une section specs techniques + highlights**

Juste **avant** le bloc `<section className="grid gap-6 md:grid-cols-2">` (ligne 88), insérer :

```tsx
      <section className="lux-panel lux-card-soft grid gap-4 p-6 md:grid-cols-4">
        <SpecTile label="Puissance" value={`${car.power} ch`} />
        <SpecTile label="Transmission" value={transmissionLabel(car.transmission)} />
        <SpecTile label="Carburant" value={fuelLabel(car.fuelType)} />
        <SpecTile label="Places" value={`${car.seats}`} />
      </section>

      {car.highlights.length > 0 && (
        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {car.highlights.map((highlight) => (
            <div
              key={highlight}
              className="lux-panel rounded-xl border border-zinc-800/70 px-4 py-3 text-sm text-zinc-200"
            >
              {highlight}
            </div>
          ))}
        </section>
      )}

      {Array.isArray(car.features) && car.features.length > 0 && (
        <section className="space-y-6">
          <h2 className="text-xl font-medium text-white">Points forts</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {(car.features as Array<{ title: string; body: string }>).map((feature) => (
              <article key={feature.title} className="lux-panel space-y-2 p-5">
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>
      )}
```

- [ ] **Step 7.4 : Ajouter le panneau "Informations location" enrichi**

Remplacer le `<div className="lux-panel lux-card-soft p-6">` du récap (lignes 89-100) par :

```tsx
        <div className="lux-panel lux-card-soft p-6">
          <h2 className="text-xl font-medium text-white">Informations location</h2>
          <ul className="mt-4 space-y-2 text-zinc-300">
            <li>Tarif semaine : {Number(car.pricePerDay).toFixed(2)} € / jour</li>
            {car.weekendPackagePrice && (
              <li>
                Forfait week-end 72h (Ven → Lun) : {Number(car.weekendPackagePrice).toFixed(2)} €
              </li>
            )}
            {car.pricePerKm && car.includedKmPerDay && (
              <li>
                Kilométrage : {car.includedKmPerDay} km / jour inclus, puis{" "}
                {Number(car.pricePerKm).toFixed(2)} € / km
              </li>
            )}
            <li>Caution : {Number(car.depositAmount).toFixed(2)} €</li>
            <li>Âge minimum conducteur : {car.minDriverAge} ans</li>
            <li>Permis depuis au moins : {car.minLicenseYears} ans</li>
          </ul>
        </div>
```

- [ ] **Step 7.5 : Ajouter les helpers en haut du fichier**

Juste après la ligne `import { notFound } from "next/navigation";` (ligne 5), ajouter :

```tsx
import type { FuelType, Transmission } from "@prisma/client";

function transmissionLabel(value: Transmission): string {
  return value === "AUTOMATIC" ? "Automatique" : "Manuelle";
}

function fuelLabel(value: FuelType): string {
  const labels: Record<FuelType, string> = {
    PETROL: "Essence",
    DIESEL: "Diesel",
    HYBRID: "Hybride",
    PLUG_IN_HYBRID: "Hybride rechargeable",
    ELECTRIC: "Électrique",
  };
  return labels[value];
}

function SpecTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="text-base text-white">{value}</p>
    </div>
  );
}
```

- [ ] **Step 7.6 : Vérifier build**

Run:
```
npm run build
```
Expected: succès.

- [ ] **Step 7.7 : Commit**

```
git add src/app/cars/[id]/page.tsx
git commit -m "feat(car-detail): display power, features, km policy, driver reqs"
```

---

## Task 8 : Enrichir la carte voiture du catalogue

**Files:**
- Modify: `src/components/cars/car-card.tsx`

- [ ] **Step 8.1 : Afficher `shortTagline` et `power` sur la carte**

Dans `src/components/cars/car-card.tsx`, dans le bloc `<div className="space-y-2">` qui contient le titre marque/modèle (lignes 51-58), remplacer par :

```tsx
          <div className="space-y-2">
            <h3 className="car-title text-2xl font-[family:var(--font-display)] leading-tight text-white transition-colors duration-500 group-hover:text-zinc-100 lg:text-3xl">
              {car.brand}
            </h3>
            <p className="car-model text-base font-light tracking-wide text-zinc-400 transition-all duration-500 group-hover:text-zinc-300">
              {car.model}
              {car.trim ? ` — ${car.trim}` : ""}
            </p>
            {car.shortTagline && (
              <p className="text-xs font-light text-zinc-500 transition-colors duration-500 group-hover:text-zinc-400">
                {car.shortTagline}
              </p>
            )}
            <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              {car.power} ch
            </p>
          </div>
```

- [ ] **Step 8.2 : Vérifier rendu via dev server**

Run (en terminal séparé) :
```
npm run dev
```
Naviguer sur `http://localhost:3000/cars`. Expected : 3 cartes dans l'ordre Clio 6 / Audi A3 / Clio 5, chacune avec tagline + puissance. Arrêter le dev server (Ctrl+C).

- [ ] **Step 8.3 : Commit**

```
git add src/components/cars/car-card.tsx
git commit -m "feat(car-card): show trim, tagline and power"
```

---

## Task 9 : Ordre d'affichage dans le service

**Files:**
- Modify: `src/services/car.service.ts`

- [ ] **Step 9.1 : Trier par `displayOrder` puis `pricePerDay`**

Dans `src/services/car.service.ts`, localiser `getCars` (lignes 18-33) et remplacer `orderBy: [{ pricePerDay: "asc" }, { createdAt: "desc" }]` par :

```ts
    orderBy: [
      { displayOrder: "asc" },
      { pricePerDay: "asc" },
      { createdAt: "desc" },
    ],
```

De même, dans `getFeaturedCars` (lignes 10-16), remplacer `orderBy: { createdAt: "desc" }` par :

```ts
    where: { status: "AVAILABLE", isFeatured: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
```

Note : on ajoute `isFeatured: true` au `where` puisque les 3 voitures sont marquées `isFeatured: true` dans le seed. Cela permettra de distinguer "mis en avant" vs catalogue complet dès qu'il y aura plus de 3 voitures.

- [ ] **Step 9.2 : Commit**

```
git add src/services/car.service.ts
git commit -m "feat(car-service): order by displayOrder and filter featured"
```

---

## Task 10 : Élargir les schémas zod de l'API admin

**Files:**
- Modify: `src/app/api/admin/cars/route.ts`
- Modify: `src/app/api/admin/cars/[id]/route.ts`

Objectif : permettre à l'API admin de créer/modifier un véhicule avec tous les nouveaux champs. L'UI admin elle-même sera refaite dans l'itération suivante, mais l'API doit déjà être prête.

- [ ] **Step 10.1 : Définir un schéma zod partagé**

Dans `src/app/api/admin/cars/route.ts`, remplacer le `carSchema` (lignes 7-19) par :

```ts
const featureSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

const carSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  brand: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().nullable().optional(),
  year: z.number().int().min(1990).max(2100),
  category: z.enum([
    "CITADINE",
    "COMPACTE",
    "BERLINE",
    "SUV",
    "COUPE",
    "CABRIOLET",
    "SPORTIVE",
  ]),
  power: z.number().int().positive(),
  transmission: z.enum(["MANUAL", "AUTOMATIC"]),
  fuelType: z.enum(["PETROL", "DIESEL", "HYBRID", "PLUG_IN_HYBRID", "ELECTRIC"]),
  seats: z.number().int().min(1).max(9).default(5),
  doors: z.number().int().min(2).max(5).default(5),
  pricePerDay: z.number().positive(),
  pricePerKm: z.number().nonnegative().nullable().optional(),
  includedKmPerDay: z.number().int().nonnegative().nullable().optional(),
  weekendPackagePrice: z.number().positive().nullable().optional(),
  weekendPackageIncludedKm: z.number().int().nonnegative().nullable().optional(),
  depositAmount: z.number().nonnegative(),
  minDriverAge: z.number().int().min(18).max(99).default(21),
  minLicenseYears: z.number().int().min(0).max(50).default(2),
  shortTagline: z.string().max(280).nullable().optional(),
  description: z.string().min(10),
  highlights: z.array(z.string().min(1)).default([]),
  features: z.array(featureSchema).default([]),
  mainImage: z.url(),
  galleryImages: z.array(z.url()).default([]),
  videoUrl: z.url().nullable().optional(),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "DISABLED"]).default("AVAILABLE"),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().nonnegative().default(0),
});
```

- [ ] **Step 10.2 : Mettre à jour `POST` pour persister les features comme JSON**

Dans le même fichier, remplacer le bloc `POST` `const car = await prisma.car.create({ data: parsed.data });` par :

```ts
    const car = await prisma.car.create({
      data: {
        ...parsed.data,
        features: parsed.data.features,
      },
    });
```

(Prisma accepte directement l'array JSON pour un champ `Json`, mais l'écriture explicite rend le mapping évident.)

- [ ] **Step 10.3 : Créer le schéma "update" en dérivant du schéma create**

Dans `src/app/api/admin/cars/[id]/route.ts`, remplacer entièrement `updateCarSchema` (lignes 7-19) par :

```ts
const featureSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
});

const updateCarSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  trim: z.string().nullable().optional(),
  year: z.number().int().min(1990).max(2100).optional(),
  category: z
    .enum(["CITADINE", "COMPACTE", "BERLINE", "SUV", "COUPE", "CABRIOLET", "SPORTIVE"])
    .optional(),
  power: z.number().int().positive().optional(),
  transmission: z.enum(["MANUAL", "AUTOMATIC"]).optional(),
  fuelType: z
    .enum(["PETROL", "DIESEL", "HYBRID", "PLUG_IN_HYBRID", "ELECTRIC"])
    .optional(),
  seats: z.number().int().min(1).max(9).optional(),
  doors: z.number().int().min(2).max(5).optional(),
  pricePerDay: z.number().positive().optional(),
  pricePerKm: z.number().nonnegative().nullable().optional(),
  includedKmPerDay: z.number().int().nonnegative().nullable().optional(),
  weekendPackagePrice: z.number().positive().nullable().optional(),
  weekendPackageIncludedKm: z.number().int().nonnegative().nullable().optional(),
  depositAmount: z.number().nonnegative().optional(),
  minDriverAge: z.number().int().min(18).max(99).optional(),
  minLicenseYears: z.number().int().min(0).max(50).optional(),
  shortTagline: z.string().max(280).nullable().optional(),
  description: z.string().min(10).optional(),
  highlights: z.array(z.string().min(1)).optional(),
  features: z.array(featureSchema).optional(),
  mainImage: z.url().optional(),
  galleryImages: z.array(z.url()).optional(),
  videoUrl: z.url().nullable().optional(),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "DISABLED"]).optional(),
  isFeatured: z.boolean().optional(),
  displayOrder: z.number().int().nonnegative().optional(),
});
```

- [ ] **Step 10.4 : Vérifier build**

Run:
```
npm run build
```
Expected: succès. Il est normal que `create-car-form.tsx` reste partiellement incomplet (il n'envoie pas encore les nouveaux champs) — ce n'est pas un blocage car le payload sans ces champs échouera côté zod, comportement attendu pour cette itération.

- [ ] **Step 10.5 : Commit**

```
git add src/app/api/admin/cars/route.ts src/app/api/admin/cars/[id]/route.ts
git commit -m "feat(admin-api): extend Car schemas with pro rental fields"
```

---

## Task 11 : Compatibilité minimale du formulaire admin existant

**Files:**
- Modify: `src/components/admin/create-car-form.tsx`

Objectif : éviter de casser la page admin `/admin/cars`. Le formulaire actuel ne peut plus créer une voiture (champs manquants côté backend), mais il doit au moins **se compiler** et afficher un message d'information en attendant la refonte.

- [ ] **Step 11.1 : Désactiver le formulaire avec un message clair**

Remplacer entièrement le contenu de `src/components/admin/create-car-form.tsx` par :

```tsx
"use client";

export function CreateCarForm() {
  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4 text-sm text-amber-100">
      <p className="font-medium">Création de véhicule temporairement indisponible</p>
      <p className="mt-1 text-amber-100/80">
        Le formulaire de création est en cours de refonte pour prendre en charge les nouvelles
        informations de véhicule (puissance, forfait week-end, conditions de location, etc.). En
        attendant, un administrateur peut ajouter des véhicules directement via le seed ou l'API.
      </p>
    </div>
  );
}
```

Rationale : plutôt que garder un formulaire cassé silencieusement, on communique clairement l'état au propriétaire du site. La refonte complète du formulaire fait l'objet de l'itération suivante (hors scope).

- [ ] **Step 11.2 : Vérifier que la colonne prix admin affiche bien `pricePerDay`**

`src/app/admin/cars/page.tsx` affiche `car.pricePerDay` à la ligne 32. Pas de changement nécessaire — la valeur existe toujours.

- [ ] **Step 11.3 : Vérifier build**

Run:
```
npm run build
```
Expected: succès.

- [ ] **Step 11.4 : Commit**

```
git add src/components/admin/create-car-form.tsx
git commit -m "chore(admin): disable legacy create form until pro rework ships"
```

---

## Task 12 : Vérification finale de bout en bout

Files: (aucune modification, vérifications uniquement)

- [ ] **Step 12.1 : Lint**

Run:
```
npm run lint
```
Expected: aucun `error`. Des warnings existants peuvent persister, ne pas en ajouter de nouveaux.

- [ ] **Step 12.2 : Build production**

Run:
```
npm run build
```
Expected: `Compiled successfully` et génération `.next-app/`.

- [ ] **Step 12.3 : Vérification catalogue via dev server**

Run:
```
npm run dev
```
Dans un navigateur :
1. `http://localhost:3000/` — la section "flotte" doit afficher exactement 3 cartes, dans l'ordre Clio 6, Audi A3, Clio 5, chacune avec tagline + puissance.
2. `http://localhost:3000/cars` — idem, 3 cartes.
3. `http://localhost:3000/cars/<id-clio6>` — la page détail doit afficher : titre, shortTagline, description, specs (156 ch / Automatique / Hybride / 5 places), 4 highlights, 2 features (Sécurité augmentée, Lignes sportives), et le panneau "Informations location" avec caution 1500 €, km inclus, âge 21 ans.
4. Dans le formulaire de réservation, choisir Ven 2026-05-01 → Lun 2026-05-04 : le prix estimé affiché doit être **320 €** (forfait), pas 3 × 34,99 €.
5. Choisir Lun 2026-05-04 → Jeu 2026-05-07 : prix **104,97 €** (3 × 34,99).

Arrêter le serveur (Ctrl+C).

- [ ] **Step 12.4 : Vérification finale base de données**

Run:
```
node -e "const {PrismaClient}=require('@prisma/client'); const p=new PrismaClient(); p.car.findMany({orderBy:{displayOrder:'asc'}, select:{slug:true, power:true, weekendPackagePrice:true, depositAmount:true}}).then(c=>{console.log(JSON.stringify(c, null, 2))}).finally(()=>p.$disconnect())"
```
Expected: 3 voitures listées dans l'ordre (clio-6, audi-a3, clio-5), avec les bonnes valeurs de puissance, forfait week-end et caution.

- [ ] **Step 12.5 : Commit final (si des ajustements mineurs ont été nécessaires)**

```
git status
# Si rien à commit : passer
git add -A
git commit -m "chore: final verification pass for catalog rework"
```

---

## Critères d'acceptation (rappel du spec)

- [x] `npm run build` passe
- [x] `npm run lint` passe
- [x] Migration Prisma propre
- [x] Seed : 3 voitures dans l'ordre Clio 6 / Audi A3 / Clio 5
- [x] `/cars` : 3 cartes avec tagline + puissance
- [x] `/cars/[id]` : description, highlights, features, caution, conditions
- [x] Réservation Ven→Lun sur Clio 6 = 320 € (forfait)
- [x] Réservation Lun→Jeu 3 nuits sur Clio 6 = 104,97 €
- [x] Le form client et l'API serveur donnent le même `totalPrice`
