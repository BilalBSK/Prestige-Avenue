# Refonte du catalogue Prestige Avenue — modèle de données

**Date** : 2026-04-19
**Statut** : design validé, prêt pour implémentation
**Scope** : base de données + logique métier + données de seed. Interface admin de gestion exclue (itération suivante).

## Contexte et motivation

Le site actuel expose un catalogue de démonstration (Mercedes Classe C, BMW Série 4, Porsche Macan, Range Rover Velar, Audi A3 générique) qui ne correspond pas à la réalité de la flotte Prestige Avenue. Les infos réelles des 3 voitures actuellement disponibles sont décrites dans `instructions-prestige.txt` :

1. **Renault Clio 6 Alpine** — 156 ch, caution 1500 €, tarif semaine 34,99 €/j + 0,30 €/km, week-end 72h à 320 €
2. **Audi A3 Sportback 2025** — 272 ch, caution 2500 €, tarif semaine 39,99 €/j + 0,30 €/km, week-end 72h à 490 €
3. **Renault Clio 5 Alpine** — 145 ch, caution 1500 €, tarif semaine 29,99 €/j + 0,30 €/km, week-end 72h à 280 €

Le schéma Prisma actuel ne permet pas de représenter correctement ces données :
- Pas de champ pour la **puissance**
- Pas de champ pour le **tarif au kilomètre**
- `weekendPrice` est utilisé par `lib/booking.ts` comme tarif **par nuit** alors que le business a un **forfait 72h**
- `description` est un simple `String` alors que les pros utilisent des sections structurées (highlights + features)
- Aucune info sur boîte/carburant/places/caution kilométrique — standard dans l'industrie de la location premium

Objectif : obtenir une base de données **parfaite et pérenne**, alignée sur les standards des plateformes de location de luxe pro (Sixt Luxury, ECS Rent, Hertz Dream Collection, Turo Luxury), afin qu'une future interface admin puisse laisser les dirigeants tout gérer sans ambiguïté.

## Objectifs de conception

- **Exactitude** : chaque donnée d'`instructions-prestige.txt` doit avoir un champ dédié, typé, non ambigu.
- **Standards métier** : les champs classiques du secteur doivent exister (transmission, carburant, places, âge min conducteur, etc.) même s'ils sont optionnels.
- **Pérennité** : schéma pensé pour supporter l'ajout futur de voitures par l'admin sans refonte.
- **Isolation** : la logique de prix week-end forfaitaire doit être encapsulée dans `lib/booking.ts`, invisible pour les consommateurs.
- **Migration non destructive** : les réservations et blocages existants de seed doivent être supprimés proprement, pas ignorés.

## Hors périmètre

- Interface admin (création/édition/suppression de voitures via UI) — itération suivante, une fois la BDD stabilisée.
- Facturation au km au retour — le `pricePerKm` est informatif pour l'instant.
- Upload d'images — les URLs externes restent le mode d'ajout.
- Multi-devise, multi-langue — FR/EUR uniquement.

## Modèle de données

### Nouvelles enums Prisma

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

### Modèle `Car` (cible)

```prisma
model Car {
  id                         String       @id @default(cuid())
  slug                       String       @unique                      // SEO, ex: "renault-clio-6-alpine"
  brand                      String
  model                      String
  trim                       String?                                    // ex: "Esprit Alpine", "S line"
  year                       Int
  category                   CarCategory

  // Specs techniques
  power                      Int                                        // chevaux
  transmission               Transmission
  fuelType                   FuelType
  seats                      Int          @default(5)
  doors                      Int          @default(5)

  // Tarification
  pricePerDay                Decimal      @db.Decimal(10, 2)            // tarif semaine, par jour
  pricePerKm                 Decimal?     @db.Decimal(10, 2)            // ex: 0.30 (informatif)
  includedKmPerDay           Int?                                       // km inclus par jour
  weekendPackagePrice        Decimal?     @db.Decimal(10, 2)            // forfait Ven→Lun 72h
  weekendPackageIncludedKm   Int?                                       // km inclus dans le forfait
  depositAmount              Decimal      @db.Decimal(10, 2)            // caution

  // Conditions de location
  minDriverAge               Int          @default(21)
  minLicenseYears            Int          @default(2)

  // Contenu éditorial
  shortTagline               String?                                    // accroche courte carte
  description                String                                     // paragraphe principal
  highlights                 String[]                                   // bullets rapides
  features                   Json                                       // [{title, body}]

  // Médias
  mainImage                  String
  galleryImages              String[]
  videoUrl                   String?

  // Administration
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

**Champs renommés** :
- `weekendPrice` → `weekendPackagePrice` (change de sémantique : forfait au lieu de tarif/nuit)

**Champs supprimés** : aucun.

**Valeurs par défaut choisies** :
- `seats = 5`, `doors = 5` : standard citadine/compacte
- `minDriverAge = 21`, `minLicenseYears = 2` : standard industrie luxe
- `isFeatured = false`, `displayOrder = 0` : neutres

### Autres modèles

Inchangés : `User`, `Booking`, `BlockedDate`, enums `Role`, `CarStatus`, `BookingStatus`, `PaymentStatus`.

## Logique métier (`src/lib/booking.ts`)

### Calcul du prix total

Aujourd'hui `calculateTotalPrice` itère jour par jour en appliquant `weekendPrice` (par nuit) aux jours de week-end. Cette logique doit être remplacée :

```
if (isExactlyFridayToMonday(start, end) && car.weekendPackagePrice != null):
    totalPrice = Number(car.weekendPackagePrice)
else:
    totalPrice = nbNuits × Number(car.pricePerDay)
```

Règles de réservation existantes (validées dans `validateBusinessBookingRules`) conservées telles quelles :
- Toute réservation touchant vendredi/samedi/dimanche doit être **exactement** Ven→Lun (72h)
- Réservations 1 jour : Lun→Jeu seulement, J+7 à J+14
- Max 2 mois à l'avance

Conséquence : le chemin "jour par jour" ne rencontre plus jamais un jour de week-end isolé. La logique devient plus simple.

### Intégration côté client

`components/booking/booking-form.tsx` doit être mis à jour pour refléter le même calcul (prop renommée `weekendPackagePrice`, logique miroir de `calculateTotalPrice`). L'aperçu doit afficher `pricePerKm` et `includedKmPerDay` si définis, avec la mention "kilométrage informatif — vérifié au retour".

## Données de seed

`prisma/seed.js` doit être réécrit pour :

1. **Nettoyer** les 5 voitures de démo actuelles (et leurs bookings/blockedDates rattachés en cascade via le schéma).
2. **Conserver** l'utilisateur admin et les 2 utilisateurs de test.
3. **Insérer** exactement les 3 voitures d'`instructions-prestige.txt`.

### Voiture 1 — Renault Clio 6 Alpine

```js
{
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
  pricePerKm: 0.30,
  includedKmPerDay: 200,
  weekendPackagePrice: 320.00,
  weekendPackageIncludedKm: 600,
  depositAmount: 1500.00,
  minDriverAge: 21,
  minLicenseYears: 2,
  shortTagline: "La citadine statutaire, lignes élégantes et technologies embarquées.",
  description: "La Renault Clio affirme une vision plus statutaire de la citadine : lignes élégantes, technologies embarquées intuitives et finitions soignées s'unissent pour offrir un confort haut de gamme et une présence qui dépasse largement son format compact.",
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
  // Medias à compléter avec les assets réels — placeholders Unsplash haute qualité auto
  mainImage: "…",
  galleryImages: ["…", "…"],
  isFeatured: true,
  displayOrder: 1,
}
```

### Voiture 2 — Audi A3 Sportback 2025

```js
{
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
  pricePerKm: 0.30,
  includedKmPerDay: 200,
  weekendPackagePrice: 490.00,
  weekendPackageIncludedKm: 600,
  depositAmount: 2500.00,
  minDriverAge: 23,
  minLicenseYears: 3,
  shortTagline: "L'hybride rechargeable premium, 272 ch et jusqu'à 142 km en électrique.",
  description: "Prenez le volant de la Nouvelle Audi A3 Sportback TFSI e et entrez dans une nouvelle ère de performance. Jusqu'à 142 km d'autonomie en électrique, une technologie de pointe et un design athlétique qui attire tous les regards. L'hybride rechargeable allie puissance, efficience et réduction des émissions pour transformer chacun de vos trajets en expérience premium.",
  highlights: [
    "272 ch",
    "142 km autonomie électrique",
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
  mainImage: "…",
  galleryImages: ["…", "…"],
  isFeatured: true,
  displayOrder: 2,
}
```

### Voiture 3 — Renault Clio 5 Alpine

```js
{
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
  pricePerKm: 0.30,
  includedKmPerDay: 200,
  weekendPackagePrice: 280.00,
  weekendPackageIncludedKm: 600,
  depositAmount: 1500.00,
  minDriverAge: 21,
  minLicenseYears: 2,
  shortTagline: "Le sport chic à portée de main, jusqu'à 80% électrique en ville.",
  description: "La Renault Clio 5 finition Alpine ne passe jamais inaperçue : look sportif, détails exclusifs et ambiance moderne à bord en font le choix parfait pour ceux qui veulent se démarquer avec style, sans compromis sur le confort.",
  highlights: [
    "145 ch",
    "80% conduite électrique en ville",
    "Jantes Alpine 17\"",
    "Finitions bleu/blanc/rouge",
  ],
  features: [
    {
      title: "Version Esprit Alpine",
      body: "Un style incisif et stimulant : flancs sculptés, calandre élargie gris chromée, éclairage full LED en forme de demi losange à l'avant. La sportivité s'exprime dans la version esprit Alpine. Jantes la flèche 17'', badge spécifique et lame F1 gris schiste mat emblématique pour l'extérieur. À l'intérieur, selleries parées du logo Alpine brodé, de surpiqûres et écusson spécifiques. Les coutures bleu/blanc/rouge du volant font référence à l'ADN esprit Alpine.",
    },
    {
      title: "Le sport chic à portée de main",
      body: "La Renault Clio 5 en version Alpine combine caractère, élégance et technologies modernes pour offrir une citadine qui attire tous les regards et transforme chaque trajet en moment privilégié.",
    },
  ],
  mainImage: "…",
  galleryImages: ["…", "…"],
  isFeatured: true,
  displayOrder: 3,
}
```

## Conséquences sur les consommateurs existants

| Fichier | Impact | Action |
|---|---|---|
| `prisma/schema.prisma` | Nouveaux champs, enums, rename | Migration Prisma dédiée |
| `prisma/seed.js` | Reset fleet + 3 nouvelles voitures | Réécriture |
| `src/lib/booking.ts` | Prix week-end → forfait | Refactor `calculateTotalPrice` |
| `src/components/booking/booking-form.tsx` | Miroir client du calcul | Prop `weekendPackagePrice`, calcul forfait |
| `src/app/cars/[id]/page.tsx` | Afficher nouveaux champs | Sections power, features, conditions |
| `src/components/cars/car-card.tsx` | `shortTagline`, `power` | Enrichir la carte |
| `src/services/car.service.ts` | Tri par `displayOrder` | Ajustement `orderBy` |
| `src/app/api/admin/cars/route.ts` | Schéma zod élargi | Ajout des champs |
| `src/app/api/admin/cars/[id]/route.ts` | Idem (update) | Ajout optionnels |
| `src/components/admin/create-car-form.tsx` | Hors scope : laisser en l'état | Ajustement minimal compat (rename `weekendPrice`) |

## Migration

Stratégie Prisma :
1. `npx prisma migrate dev --name catalog_data_model_rework`
2. Migration SQL :
   - `CREATE TYPE` pour les 3 nouvelles enums
   - `ALTER TABLE "Car" RENAME COLUMN "weekendPrice" TO "weekendPackagePrice"`
   - `ALTER TABLE "Car" ADD COLUMN` pour chaque nouveau champ (nullables ou avec défaut pour ne pas casser les lignes existantes)
   - `UPDATE "Car" SET slug = …, category = …` (back-fill déterministe) avant de poser `NOT NULL` sur les champs requis
   - `CREATE UNIQUE INDEX` sur `slug`
   - Nouveaux index (`isFeatured, displayOrder`, `category, status`)
3. `npx prisma generate`
4. `npm run seed` (reset + 3 vraies voitures)

## Vérification

Critères d'acceptation :

- [ ] `npm run build` passe sans erreur de type
- [ ] `npm run lint` passe
- [ ] `npx prisma migrate dev` produit une migration appliquée proprement
- [ ] Après `npm run seed`, `prisma.car.findMany()` retourne exactement 3 voitures, dans l'ordre Clio 6 / Audi A3 / Clio 5
- [ ] La page `/cars` affiche 3 cartes, dans le bon ordre, avec shortTagline et puissance
- [ ] La page `/cars/[id]` de chaque voiture affiche description, highlights, features, caution, conditions de location
- [ ] Une réservation Ven→Lun sur la Clio 6 calcule 320 € (forfait) et non 3 × 34,99 €
- [ ] Une réservation Lun→Jeu sur la Clio 6 calcule 3 × 34,99 € = 104,97 €
- [ ] Le form côté client et l'API serveur donnent le même `totalPrice`
