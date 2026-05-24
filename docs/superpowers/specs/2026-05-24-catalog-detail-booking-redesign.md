# Catalogue, Détail Voiture & Réservation — Refonte

**Date :** 2026-05-24
**Statut :** Spec validée

## 1. Objectif

Aligner les pages `/cars` (catalogue) et `/cars/[id]` (détail) sur la nouvelle direction visuelle de la home (deep onyx, Fraunces × DM Sans, animations cinématiques), et remplacer le parcours de paiement Stripe par un parcours de **demande de réservation** validée manuellement par l'admin. Le paiement et la caution sont gérés hors plateforme (sur place ou par virement).

## 2. Direction visuelle

Mêmes règles que la home (cf. `2026-05-24-home-redesign-design.md` §1) :
- Tokens `--ink-*` exclusifs (jamais de couleur autre que blanc cassé en accent)
- Fraunces SOFT pour les titres, italiques pour l'emphase ; DM Sans pour le corps et les labels uppercase tracking-wide
- Hairlines (1px), bordures `--ink-line`, surfaces `--ink-surface`
- Reveal-on-scroll via `useRevealOnScroll` + classes `.reveal-*`
- Smooth scroll Lenis hérité du root layout
- `prefers-reduced-motion` respecté partout

## 3. Modèle de données

### 3.1 Migration Prisma

**Drop sur `Booking` :**
- `paymentStatus` (enum `PaymentStatus`)
- `stripeCheckoutSessionId` (String?)
- `depositAmount` (Decimal)
- `remainingBalance` (Decimal)

**Drop d'enum :**
- `PaymentStatus` (PENDING / PAID / REFUNDED / FAILED) — supprimé

**Ajout sur `Booking` :**
- `customerMessage String?` — message libre du client (optionnel)

**Modification de l'enum `BookingStatus` :**
- Ancien : `PENDING / CONFIRMED / CANCELLED / COMPLETED`
- Nouveau : `PENDING_REVIEW / CONFIRMED / IN_PROGRESS / COMPLETED / CANCELLED / DECLINED`
  - `PENDING_REVIEW` : demande client, en attente de validation admin (statut par défaut à la création)
  - `CONFIRMED` : admin a validé, le véhicule est réservé pour les dates
  - `IN_PROGRESS` : le client a pris le véhicule
  - `COMPLETED` : véhicule rendu
  - `CANCELLED` : annulation après confirmation (par admin ou client)
  - `DECLINED` : refus par l'admin avant confirmation

### 3.2 Règles de transition

```
PENDING_REVIEW ─┬─→ CONFIRMED ─┬─→ IN_PROGRESS ─→ COMPLETED
                │              │
                ↓              ↓
              DECLINED      CANCELLED
```

Seul l'admin déclenche les transitions. Pas d'auto-confirmation côté client.

### 3.3 Disponibilité

Une voiture est **indisponible** sur une plage de dates si :
- Une `BlockedDate` la couvre, OU
- Un `Booking` en statut `CONFIRMED` ou `IN_PROGRESS` chevauche

Les bookings `PENDING_REVIEW` **ne bloquent pas** les dates. Si deux clients demandent les mêmes dates, les deux passent en `PENDING_REVIEW` ; l'admin tranche manuellement (validation de la première, refus de la seconde avec motif).

L'idempotence par `submissionToken` (Prisma) reste pour éviter les doubles soumissions du même client.

## 4. Cleanup Stripe

### À supprimer
- `src/lib/stripe.ts`
- `src/app/api/stripe/webhook/route.ts` + dossier
- `src/app/api/bookings/checkout/route.ts`
- `src/app/booking/success/page.tsx` + dossier
- `src/app/booking/cancel/page.tsx` + dossier
- Variables `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` du `.env.example` et `CLAUDE.md`
- Dépendance `stripe` du `package.json`

### À adapter
- `src/services/booking.service.ts` (ou créer si absent) — nouvelle fonction `createBookingRequest()`
- `src/lib/booking.ts` — drop de `calculateDeposit()`, on garde uniquement `calculateBookingPrice()` pour affichage

## 5. Parcours public

### 5.1 Catalogue `/cars`

**Layout**
1. **Hero condensé** (h-[55vh], pt en compensant le header fixe de 80px)
   - Counter "— 01 / 02"
   - h1 Fraunces "Catalogue *complet.*" (clamp 56–88px)
   - Sous-titre DM Sans en `--ink-text-soft`
   - Compteur de véhicules "07 véhicules disponibles" (auto-calculé)
   - Reveal-line animée sous le titre
2. **Toolbar sticky** sous le hero (top-20 = sous le header)
   - h-16, fond `rgba(5,5,5,0.85)` + `backdrop-blur-md`, border-bottom `--ink-line`
   - Layout flex justify-between :
     - Left : dropdown "Tri : —" (hover trigger)
     - Center : 4 pill triggers (Prix / Transmission / Carburant / Marques)
     - Right : "Tout effacer" (lien italic Fraunces avec `→`)
3. **Grille** (`reveal-stagger` au mount + à chaque changement de filtres)
   - 3 cols desktop, 2 tablette, 1 mobile, gap 14px
   - `CarCard` (existante)
4. **Empty state** (si zéro résultat)
   - Centré, py-24
   - Phrase Fraunces "Aucune voiture *ne correspond*."
   - Lien "Réinitialiser les filtres" `→`

**Filtres (popovers)**
- **Prix** : slider min/max avec labels en DM Sans (50€ → 800€), step 10€
- **Transmission** : 3 pills exclusives (Toutes / Auto / Manuelle)
- **Carburant** : 5 pills multi-select (Essence / Diesel / Hybride / Hybride rechargeable / Électrique)
- **Marques** : multi-select chip list dérivée des cars en base, max-h scrollable

**Tri (dropdown)**
- "Prix croissant" (default)
- "Prix décroissant"
- "Puissance"
- "Plus récent"

**URL params synchronisés**
- `?minPrice=50&maxPrice=300&transmission=AUTOMATIC&fuelType=HYBRID,ELECTRIC&brands=Audi,BMW&sortBy=power`
- Bookmarkable et partageable
- `useRouter().replace(...)` côté client (pas de full page reload)
- Debounce 300ms sur le slider de prix

### 5.2 Détail voiture `/cars/[id]`

**Sections (top to bottom)**
1. **Hero galerie** (h-[88vh])
   - Image principale full-width
   - Subtle Ken Burns (scale 1.0 → 1.05 sur 12s, alterne) — désactivé en reduced-motion
   - Overlay gradient bas (transparent → rgba(5,5,5,0.95))
   - Breadcrumb top-left : "Catalogue → [Brand] [Model]" en DM Sans 11px tracking-wide
   - Badge bottom-right : "À partir de" / Fraunces "XXX €/jour"
   - Reveal blur+fade au mount
2. **Title block** (py-32)
   - SectionCounter "— Modèle"
   - h1 Fraunces clamp(54–96px) : "[Brand] *[Model]*"
   - Tagline (`car.shortTagline`) en Fraunces italic, max-w-3xl
   - Description (`car.description`) en DM Sans `--ink-text-soft`
   - Reveal-fade-up
3. **Galerie horizontale** (h-[70vh], py-16)
   - Container scroll horizontal `snap-x snap-mandatory`
   - Chaque image w-[80vw] aspect-[16/10] snap-center
   - Indicateur en bas à droite "01 / 06" (sticky en bas du container)
   - Hint "← Glissez →" en italic Fraunces (premier visit, dismissible)
   - Snap désactivé en reduced-motion
4. **Specs grid** (py-32, 4 colonnes)
   - Pour chaque : numéro Fraunces clamp(40–64px) en italic + label DM Sans uppercase
   - Hairlines verticales entre les colonnes (border-l `--ink-line`)
   - Reveal-stagger
5. **Highlights** (si `car.highlights.length > 0`, grid 2 cols)
   - Pour chaque : panel avec hover hairline (réutilise treatment d'`InfoCard`)
6. **Features** (si `car.features.length > 0`, grid 2 cols)
   - Pour chaque feature : titre Fraunces + body DM Sans, séparateur hairline
7. **Vidéo** (si `car.videoUrl`, full-width)
   - Aspect-video, lazy-loaded via iframe loading="lazy"
   - Border `--ink-line`
8. **Tarification** (panel centré max-w-3xl, py-32)
   - Titre Fraunces "Conditions *de location.*"
   - Liste verticale épurée, hairlines entre les lignes :
     - Tarif jour (semaine)
     - Forfait weekend (si défini)
     - Kilométrage inclus + prix au km
     - Caution
     - Âge minimum
     - Permis depuis
9. **CTA réservation** (full-width, py-32, center)
   - Phrase Fraunces "Prêt à *prendre la route* ?" clamp(40–72px)
   - Bouton ivoire géant "Demander cette voiture" + ticker arrow
   - Au clic → ouvre `BookingRequestSheet`

### 5.3 BookingRequestSheet

Drawer slide-in depuis la droite, plein écran sur mobile.

**Header (sticky top)**
- Miniature de la voiture (60x40, rounded)
- Brand/Model en Fraunces
- Bouton fermeture top-right

**Progress bar** (sous le header)
- 3 ticks : "01 — Dates" / "02 — Vous" / "03 — Confirmation"
- Tick actif en `--ink-ivory`, autres en `--ink-dim`
- Hairline progress qui s'étend sous les ticks

**Step 1 — Dates**
- Date-range picker (deux inputs `type="date"` côte à côte avec labels Fraunces)
- Vérification dispo en live au blur (réutilise `/api/cars/[id]/availability`)
- Calcul prix estimé en live :
  - Nombre de nuits
  - Total estimé en Fraunces clamp(30–48px)
  - Note "Le paiement se fait sur place — pas de réservation en ligne"
- Validation Zod du step (dates valides + dispo)
- Bouton primaire bottom (sticky) "Continuer →"

**Step 2 — Coordonnées**
- Inputs DM Sans : Prénom, Nom, Email, Téléphone (grid 2 cols)
- Textarea optionnelle : "Un message ?" (3 lignes, placeholder "Préférences de prise en charge, questions…")
- Validation Zod
- Boutons : "← Retour" (ghost) + "Continuer →" (primaire)

**Step 3 — Confirmation**
- Récap visuel (pas de form) :
  - Voiture (vignette + nom)
  - Dates (formatées en français long)
  - Prix estimé
  - Vos coordonnées (compactes)
- Texte explicatif Fraunces : "Notre équipe vous rappellera sous *24 heures* pour valider votre demande et organiser le paiement."
- Bouton primaire "Envoyer ma demande" (avec spinner pendant submit)

**Submit**
- POST `/api/bookings/request` avec CSRF token
- Body : `{ carId, firstName, lastName, email, phone, customerMessage?, startDate, endDate, submissionToken }`
- Réponse OK : `{ bookingId }` → redirect vers `/booking/confirmation/[bookingId]`
- Réponse erreur : affiche le message dans le step 3

**Animations**
- Transitions horizontales entre steps (translateX +20px → 0, opacity)
- Sheet slide-in depuis la droite (translateX 100% → 0, 400ms)

### 5.4 Page de confirmation `/booking/confirmation/[id]`

Server component, fetch le booking par ID. Si introuvable ou statut autre que `PENDING_REVIEW`, redirige vers `/`.

**Contenu**
- Hero centré py-32
- Counter "— Demande envoyée"
- Phrase Fraunces clamp(54–88px) : "Merci, *nous vous rappelons.*"
- Sous-texte DM Sans : "Votre demande #[BOOKING_ID_SHORT] a bien été enregistrée. Notre équipe vous contactera sous 24 heures au [phone] pour valider votre réservation."
- Récap discret (date + voiture)
- 2 CTAs : "Retour à l'accueil" (ghost) + "Voir le catalogue" (primaire)

## 6. Côté admin

### 6.1 `/admin/bookings`

**Section "Demandes en attente"** (en haut, badge proéminent si > 0)
- Compte des `PENDING_REVIEW`
- Liste compacte avec date, client, voiture, dates demandées, montant estimé
- Boutons par ligne : "Confirmer" / "Refuser" / "Voir détails"

**Section "Toutes les réservations"** (existante, adaptée)
- Tableau avec filtres par statut (chip pills)
- Colonnes : ID, Client, Voiture, Période, Montant, Statut (pill colorée), Actions

**Statuts visuels**
- `PENDING_REVIEW` : pill ivoire/cream
- `CONFIRMED` : pill vert sourd
- `IN_PROGRESS` : pill bleu sourd
- `COMPLETED` : pill gris
- `CANCELLED` / `DECLINED` : pill rouge sourd

### 6.2 Détail booking admin

Sheet ou page dédiée avec :
- Toutes les infos client + message
- Voiture
- Dates
- Prix estimé (display only, pas de paiement enregistré)
- Boutons d'action selon le statut courant :
  - `PENDING_REVIEW` → "Confirmer" / "Refuser" (avec champ motif)
  - `CONFIRMED` → "Marquer en cours" / "Annuler"
  - `IN_PROGRESS` → "Clôturer" / "Annuler"
- Historique des transitions (timestamps)

### 6.3 Notifications

**Décision : pas d'envoi d'email automatique pour cette itération.** L'admin voit les nouvelles demandes dans son dashboard avec badge proéminent. Un envoi email pourra être ajouté plus tard (Resend / SMTP) sans impact sur le schéma.

## 7. Architecture des fichiers

### Nouveaux

| Path | Responsabilité |
|------|---------------|
| `src/components/cars/cars-toolbar.tsx` | Sticky toolbar (filtres + tri), client component |
| `src/components/cars/cars-filter-popover.tsx` | Popover réutilisable pour chaque filtre |
| `src/components/cars/cars-grid.tsx` | Grille avec reveal-stagger, client wrapper |
| `src/components/cars/cars-empty-state.tsx` | État vide |
| `src/components/cars/car-detail-hero.tsx` | Hero galerie h-[88vh] avec Ken Burns, client |
| `src/components/cars/car-gallery.tsx` | Galerie horizontale scroll-snap, client |
| `src/components/cars/car-specs.tsx` | Grid 4 colonnes specs |
| `src/components/cars/car-pricing-panel.tsx` | Panel tarification |
| `src/components/cars/car-cta-section.tsx` | CTA finale "Demander cette voiture" |
| `src/components/booking/booking-request-sheet.tsx` | Drawer multi-step orchestrateur, client |
| `src/components/booking/booking-step-dates.tsx` | Step 1 |
| `src/components/booking/booking-step-contact.tsx` | Step 2 |
| `src/components/booking/booking-step-review.tsx` | Step 3 |
| `src/components/booking/booking-progress.tsx` | Progress bar 3 ticks |
| `src/components/ui/sheet.tsx` | Primitive sheet réutilisable (slide-in droite) |
| `src/components/ui/popover.tsx` | Primitive popover réutilisable |
| `src/components/ui/range-slider.tsx` | Range slider min/max |
| `src/app/booking/confirmation/[id]/page.tsx` | Page de remerciement |
| `src/app/api/bookings/request/route.ts` | POST endpoint, remplace checkout |
| `src/services/booking.service.ts` | `createBookingRequest()`, `getBookingById()` |
| `prisma/migrations/<ts>_drop_payment_fields/migration.sql` | Migration |

### Réécrits

| Path | Nature |
|------|--------|
| `src/app/cars/page.tsx` | Server, parse searchParams enrichis, hero + toolbar + grid |
| `src/app/cars/[id]/page.tsx` | Server, orchestre les 9 sections |
| `src/services/car.service.ts` | `getCars()` accepte `transmission`, `fuelType[]`, `brands[]`, `sortBy` |
| `src/lib/booking.ts` | Drop `calculateDeposit()`, garde `calculateBookingPrice()` |
| `prisma/schema.prisma` | Suppressions + ajout `customerMessage` + nouvel enum |
| `src/app/admin/bookings/page.tsx` | Section "Demandes en attente" en tête |
| `src/components/admin/booking-actions.tsx` | Nouveaux boutons par statut |
| `CLAUDE.md` | MAJ section "Booking Business Rules" |

### Supprimés

| Path | Raison |
|------|--------|
| `src/lib/stripe.ts` | Plus de Stripe |
| `src/app/api/stripe/webhook/route.ts` + dossier | Plus de Stripe |
| `src/app/api/bookings/checkout/route.ts` | Remplacé par `/request` |
| `src/app/booking/success/` (dossier complet) | Plus de Stripe |
| `src/app/booking/cancel/` (dossier complet) | Plus de Stripe |
| `src/components/booking/booking-form.tsx` | Remplacé par `booking-request-sheet.tsx` |

### Dépendances

**Ajouts npm** (à valider lors de l'implémentation, certaines déjà présentes) :
- Aucune lib de drawer/popover externe — primitives custom (style cohérent avec le reste, pas de dépendance Radix par défaut, on évalue à l'étape Plan)

**Suppressions npm** :
- `stripe`

## 8. API

### POST `/api/bookings/request`

**Headers** : `x-csrf-token` requis (double-submit cookie)

**Body**
```ts
{
  carId: string;
  firstName: string;     // min 2
  lastName: string;      // min 2
  email: string;         // valid email
  phone: string;         // min 8
  startDate: string;     // ISO date
  endDate: string;       // ISO date, > startDate
  customerMessage?: string;  // optional, max 500
  submissionToken: string;   // UUID
}
```

**Validation côté serveur**
- Zod sur le payload
- Règles métier de `src/lib/booking.ts` (weekend Ven→Lun, 1-jour Lun-Jeu J+7 à J+14, max 2 mois)
- Vérification dispo (BlockedDates + bookings CONFIRMED/IN_PROGRESS)
- Idempotence : si `submissionToken` existe déjà → renvoie le booking existant

**Réponse OK 200**
```ts
{ bookingId: string }
```

**Erreurs**
- 400 : payload invalide
- 409 : créneau indisponible
- 422 : règles métier violées (weekend mal formé, etc.)
- 500 : erreur serveur

### GET `/api/cars/[id]/availability` (existant, conservé)

Pas de changement. Sert à la vérification live dans le step 1 du sheet.

## 9. Performance & a11y

- Images Next/Image avec `sizes` adapté à chaque section (hero `100vw`, gallery `80vw`, grid `(max-width: 768px) 100vw, 33vw`)
- Reveal animations désactivées en reduced-motion (déjà géré globalement dans `globals.css`)
- Sheet accessible : focus trap, Escape ferme, fond clickable ferme, `aria-modal="true"`, `role="dialog"`
- Toolbar sticky : utilise `position: sticky` natif, pas de JS pour le pin
- Filter popovers : focus management (Tab cycle dans le popover), Escape ferme
- Date inputs natifs HTML5 (pas de lib de calendrier custom — accessibles par défaut)

## 10. Critères de succès

- [ ] Un client peut filtrer le catalogue par prix, transmission, carburant, marques et trier le résultat
- [ ] Un client peut consulter le détail d'une voiture (hero, galerie, specs, tarification)
- [ ] Un client peut demander une réservation en 3 steps depuis le détail
- [ ] Un client reçoit une page de confirmation après envoi avec son ID de demande
- [ ] L'admin voit les nouvelles demandes en haut de `/admin/bookings`
- [ ] L'admin peut confirmer / refuser / annuler / clôturer une demande
- [ ] Plus aucune trace de Stripe dans le code, le schéma, ou le `.env.example`
- [ ] La home + admin ne régressent pas
- [ ] La build passe en production sans warning bloquant
- [ ] Lighthouse Performance ≥ 80 sur `/cars` et `/cars/[id]`

## 11. Hors-scope

- Système d'envoi d'email (admin notifications) — itération future
- Multi-langue — UI reste en français uniquement
- Système de comptes clients (login public) — pas de besoin pour cette itération
- Wishlist / favoris — pas demandé
- Comparaison de véhicules côte à côte — pas demandé
