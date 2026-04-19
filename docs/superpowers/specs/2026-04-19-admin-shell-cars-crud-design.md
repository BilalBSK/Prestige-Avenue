# Admin Shell + Voitures CRUD — Design Spec

**Date:** 2026-04-19
**Scope:** Spec #1 de la refonte admin (sur 5 sous-projets : shell+cars, bookings, blocked-dates, clients, dashboard).
**Statut source de vérité:** ce document.

---

## 1. Objectif

Reconstruire from scratch un espace admin professionnel permettant aux **2 dirigeants** de Prestige Avenue de gérer leur flotte de voitures en autonomie totale : création, édition, suppression, mise en avant, réordonnancement, gestion des médias. Ce spec livre aussi le **shell admin** (layout, auth, navigation, primitives UI, upload d'images) qui servira de socle aux modules futurs (réservations, dates bloquées, clients, dashboard).

Les 2 admins ont **tous les droits sans exception**, identiques. Pas de rôle granulaire : le seul niveau est `ADMIN` vs `USER`.

---

## 2. Périmètre

### Inclus
- Shell admin (layout, sidebar active, topbar, user-menu, auth-gate)
- Primitives UI admin (Button, Input, Textarea, Select, Switch, NumberInput, Toast, ConfirmDialog, ImagePicker, MediaGallery)
- Upload d'images via Vercel Blob
- Page liste voitures (tableau, filtres, reorder drag&drop, toggle featured inline, actions)
- Page création voiture (formulaire complet, toutes les sections pro)
- Page édition voiture (même formulaire)
- Soft-delete intelligent (soft si booking existe, hard sinon)
- Server Actions pour toutes les mutations
- Dashboard placeholder "Coming soon" en attendant le spec dédié

### Hors scope
- Modules bookings / blocked-dates / clients / dashboard KPI (specs suivants)
- Nettoyage blobs orphelins (à automatiser plus tard)
- Audit trail des actions admin
- Multi-rôles granulaires
- i18n (tout en français, EUR)

---

## 3. Architecture

### Structure de fichiers

```
src/app/(admin)/                        route group, layout dédié
  layout.tsx                            shell + auth gate serveur
  loading.tsx
  dashboard/page.tsx                    placeholder pro
  cars/
    page.tsx                            liste + actions
    new/page.tsx                        création
    [id]/edit/page.tsx                  édition

src/components/admin/
  shell/
    admin-sidebar.tsx                   sidebar avec active-state
    admin-topbar.tsx                    breadcrumb + user-menu
    admin-user-menu.tsx                 avatar + déconnexion
  ui/
    button.tsx                          variants primary/secondary/ghost/danger
    input.tsx
    textarea.tsx
    number-input.tsx
    select.tsx
    switch.tsx
    field.tsx                           wrapper label + error + hint
    toast.tsx + toast-provider.tsx      notifications impératives
    confirm-dialog.tsx                  modal confirmation
    image-picker.tsx                    upload 1 image
    media-gallery.tsx                   upload N images avec reorder
    tags-input.tsx                      éditeur string[] (highlights)
    features-editor.tsx                 éditeur {title, body}[]
  cars/
    cars-list.tsx                       tableau serveur-props
    cars-list-row.tsx                   ligne (drag handle + actions)
    cars-filters.tsx                    filtres URL-state
    car-form.tsx                        formulaire partagé create/edit
    delete-car-button.tsx               bouton + ConfirmDialog
    toggle-featured-switch.tsx          switch inline

src/server/admin/
  cars.schema.ts                        zod schéma partagé client/serveur
  cars.actions.ts                       Server Actions CRUD
  cars.queries.ts                       server-side data fetching
  upload.actions.ts                     Server Action Vercel Blob token

src/lib/
  admin-auth.ts                         requireAdminSessionOrRedirect
  blob.ts                               helpers validation (mime, taille)
  slugify.ts                            helper slug from brand+model+trim
```

### Pourquoi ce découpage

- **Route group `(admin)`** isole le layout admin sans changer l'URL (`/admin/cars` reste stable).
- **Server Actions** pour les mutations : Next 15 gère la CSRF via origin + action IDs signés, typage bout-en-bout avec zod, pas de handler JSON à maintenir. Les API routes admin existantes (`/api/admin/cars/*`) seront supprimées.
- **Composants UI scopés admin** (`components/admin/ui/`) : primitives minimales maison, aucune dépendance lourde type Radix.
- **`server/admin/*`** : sépare logique métier admin du routing. Convention idiomatique Next 15.
- **Schéma zod partagé** : une seule source de vérité côté client (react-hook-form) et serveur (Server Action re-validation).

---

## 4. Auth & sécurité

### Gate admin
Helper `requireAdminSessionOrRedirect()` dans `src/lib/admin-auth.ts` :

```ts
export async function requireAdminSessionOrRedirect() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return session;
}
```

Appelé en **première ligne** de :
- `src/app/(admin)/layout.tsx` (protection de toutes les pages admin)
- Chaque Server Action dans `src/server/admin/*.actions.ts`

Le middleware global reste pour la CSRF cookie publique (non-admin). On retire la partie `/admin/*` du middleware (double-protection fragile, remplacée par le gate layout + gate action).

### CSRF
- **Server Actions** : Next 15 signe les action IDs et vérifie l'origine. Pas de double-submit cookie.
- **API publique** (booking checkout) : garde le mécanisme CSRF actuel (inchangé).

### Upload
- Token signé Vercel Blob généré côté serveur avec `handleUpload` de `@vercel/blob/client`.
- Client uploade directement au CDN (pas de proxy serveur — perf + coût).
- Validation mime + taille côté serveur AVANT émission du token.

---

## 5. Design system admin (primitives)

| Composant | Props principaux | Comportement |
|---|---|---|
| `<Button variant size loading>` | variant: primary/secondary/ghost/danger ; size: sm/md | disabled quand loading, spinner |
| `<Input>` | type, placeholder, error | Style unifié, aria-invalid si error |
| `<Textarea>` | rows, error | Idem |
| `<NumberInput>` | min, max, step, unit (ex: "€", "ch") | Suffixe visuel, parse nombre |
| `<Select options>` | options: `{value, label}[]` | Native select stylé |
| `<Switch>` | checked, onCheckedChange, disabled | Toggle visuel, aria-checked |
| `<Field label error hint required>` | wrapper | htmlFor auto, message erreur sous le champ |
| `<Toast>` + `toast.success/error/info` | message, duration | Store global impératif maison (Zustand-like léger, ~30 lignes) |
| `<ConfirmDialog>` | title, description, confirmLabel, variant | Retourne `Promise<boolean>` |
| `<ImagePicker>` | value, onChange, folder, maxSizeMB | Drag-drop + click, preview, remplacer, supprimer |
| `<MediaGallery>` | value, onChange, folder, maxSizeMB, maxItems | Grille + reorder drag + supprimer par image |
| `<TagsInput>` | value, onChange, maxItems | Input + Enter/virgule pour ajouter, chips suppressibles |
| `<FeaturesEditor>` | value, onChange, maxItems | Liste de cartes {title, body}, add/remove/reorder |

### Styling
- Base : `bg-zinc-950`, texte `text-zinc-200`, bordures `border-zinc-800`
- Primary CTA : `bg-amber-500 text-black hover:bg-amber-400`
- Danger : `bg-red-600 text-white hover:bg-red-500`
- Focus visible : `ring-2 ring-amber-500/50`
- Font : inchangée (fonts globales du projet)

### Accessibilité
- Focus visible partout
- `aria-*` pour états (checked, invalid, busy)
- Navigation clavier complète (Tab, Enter, Esc pour modales)
- Labels explicites via `<Field label>`

---

## 6. Shell admin

### `src/app/(admin)/layout.tsx`
Serveur.
1. `await requireAdminSessionOrRedirect()` en première ligne.
2. Renvoie `<AdminShell user={session.user}>{children}</AdminShell>`.
3. Inclut `<ToastProvider>` en racine.

### `<AdminSidebar>`
- Liens : Dashboard, Voitures, Réservations, Clients, Dates bloquées
- Active-state visuel (fond amber, texte noir)
- Fixe à gauche sur desktop (w-64), drawer sur mobile (bouton hamburger en topbar)
- Footer sidebar : logo Prestige Avenue + version discrète

### `<AdminTopbar>`
- Breadcrumb contextuel (ex: "Voitures > Nouveau véhicule")
- À droite : `<AdminUserMenu>` (avatar initiales, email, bouton "Déconnexion")

### `<AdminUserMenu>`
- Dropdown simple
- Action déconnexion → `signOut({ callbackUrl: "/admin/login" })`

---

## 7. Page `/admin/cars` (liste)

### Layout
- Header : titre "Voitures" + bouton primaire "Nouveau véhicule" (→ `/admin/cars/new`)
- `<CarsFilters>` : search (brand/model/slug), status multi-select, featured on/off — state URL-persistent
- `<CarsList>` : tableau responsive

### Tableau
Colonnes :
1. **Drag handle** (réserve 32px) — active le mode reorder par drag via `@dnd-kit/sortable`
2. **Image miniature** (48x48, object-cover)
3. **Véhicule** : Brand + Model + Trim, slug en gris dessous
4. **Catégorie** (badge)
5. **Statut** : pastille colorée (AVAILABLE vert, BOOKED bleu, MAINTENANCE amber, DISABLED rouge)
6. **Prix/jour** (tabular-nums)
7. **Week-end** (forfait ou "—")
8. **Featured** : `<ToggleFeaturedSwitch>` inline
9. **Actions** : boutons icônes → Éditer, Supprimer

### Reorder
- Drag entière ligne
- Pendant drag : preview visuelle, lignes autour glissent
- Drop → appel Server Action `reorderCars(orderedIds)` → revalidation + toast "Ordre mis à jour"
- Si échec → rollback visuel + toast erreur

### Toggle featured
- `<Switch>` inline
- Optimistic UI : flip immédiat côté client
- Server Action `toggleCarFeatured(id)` → si échec, revert + toast erreur

### Suppression
- Clic bouton poubelle → `<ConfirmDialog>` :
  - Titre : "Supprimer {brand} {model} ?"
  - Description contextuelle :
    - Si voiture n'a jamais été réservée : "Cette voiture sera définitivement supprimée."
    - Si voiture a des bookings : "Cette voiture sera désactivée et cachée du catalogue. Les réservations existantes sont conservées."
  - Bouton confirm rouge : "Supprimer" / "Désactiver" selon cas
- Serveur détermine hard vs soft selon `Booking.count({ where: { carId } })`

### États vides / erreurs
- Aucune voiture : CTA "Créer votre premier véhicule"
- Aucun résultat filtré : "Aucune voiture ne correspond à ces filtres" + bouton "Réinitialiser"
- Erreur fetch : boundary `error.tsx` admin

---

## 8. Page `/admin/cars/new` + `/admin/cars/[id]/edit`

### Composant partagé `<CarForm mode="create"|"edit" initial={...}>`

#### Sections (toutes visibles, pas de wizard)

**Section 1 — Identité**
- brand (Input, required)
- model (Input, required)
- trim (Input, optional)
- year (NumberInput 1990–2030, required)
- slug (Input, auto-généré depuis brand+model+trim via `slugify()`, éditable, regex `^[a-z0-9-]+$`, unicité serveur)
- category (Select CarCategory enum, required)
- shortTagline (Input 150 char max)

**Section 2 — Spécifications**
- power (NumberInput unit="ch", required)
- transmission (Select Transmission enum, required)
- fuelType (Select FuelType enum, required)
- seats (NumberInput 2–9, default 5, required)
- doors (NumberInput 2–5, default 5, required)

**Section 3 — Tarifs**
- pricePerDay (NumberInput unit="€", step=0.01, required, positive)
- pricePerKm (NumberInput unit="€/km", step=0.01, optional, positive ou null)
- includedKmPerDay (NumberInput unit="km", optional, positive ou null)
- weekendPackagePrice (NumberInput unit="€", optional, positive ou null)
- weekendPackageIncludedKm (NumberInput unit="km", optional, positive ou null)
- depositAmount (NumberInput unit="€", required, positive)

**Section 4 — Conditions location**
- minDriverAge (NumberInput 18–99, default 21, required)
- minLicenseYears (NumberInput 0–50, default 2, required)

**Section 5 — Présentation**
- description (Textarea rows=6, required, 50–2000 char)
- highlights (TagsInput, max 8, chaque item 3–80 char)
- features (FeaturesEditor, max 10, chaque item `{title 3–60, body 10–300}`)

**Section 6 — Médias**
- mainImage (ImagePicker, required)
- galleryImages (MediaGallery, max 12, min 0)
- videoUrl (Input, optional, validation URL)

**Section 7 — Visibilité**
- status (Select CarStatus enum, default AVAILABLE)
- isFeatured (Switch, default false)
- displayOrder (NumberInput, read-only en mode create avec hint "Définissable depuis la liste après création" ; éditable discrètement en mode edit)

#### Validation
- **Client** : `react-hook-form` + `zodResolver` sur `carFormSchema` importé de `src/server/admin/cars.schema.ts`
- **Serveur** : re-parse du même schéma dans la Server Action (defense in depth)
- **Erreurs par champ** : affichées sous l'input (rouge, xs)
- **Scroll auto** vers le premier champ en erreur au submit

#### Soumission
- Bouton primary "Enregistrer" + secondary "Annuler"
- Pendant submit : boutons disabled + spinner sur primary
- Succès create : toast "Véhicule ajouté" → `router.replace("/admin/cars")`
- Succès edit : toast "Modifications enregistrées" → reste sur page, form reset à l'état serveur
- Échec : toast error avec message, form reste interactif

---

## 9. Upload images (Vercel Blob)

### Flux
1. Utilisateur sélectionne fichier dans `<ImagePicker>` ou `<MediaGallery>`
2. Composant appelle helper `uploadImageToBlob(file, folder)` qui :
   - Vérifie mime côté client (`image/jpeg|image/png|image/webp|image/avif`)
   - Vérifie taille côté client (≤ 5 Mo)
   - Appelle Server Action `createUploadToken({ filename, mime, size, folder })`
3. Server Action `createUploadToken` (dans `src/server/admin/upload.actions.ts`) :
   - `requireAdminSessionOrRedirect()`
   - Re-valide mime + taille serveur (obligatoire — client peut être bypass)
   - Génère path : `cars/{folder}/{uuid}.{ext}` — folder = carId si edit, "new" si create
   - Retourne token signé via `@vercel/blob/client` `generateClientTokenFromReadWriteToken`
4. Client PUT direct au blob → URL publique
5. URL injectée dans form state (non persistée en DB tant que submit pas appelé)
6. Progress bar pendant upload
7. Erreur upload → toast + slot vide reste disponible

### Limites
- mainImage : 1 fichier, 5 Mo max, types image/(jpeg|png|webp|avif)
- galleryImages : jusqu'à 12, 5 Mo chacun
- videoUrl : URL externe (YouTube/Vimeo), pas d'upload vidéo

### Blobs orphelins
- Hors scope de ce spec
- Documenté comme dette : une Server Action de nettoyage à construire plus tard (compare blob listing avec URLs en DB, supprime les orphelins > 24h)

---

## 10. Server Actions (surface)

```ts
// src/server/admin/cars.actions.ts
"use server";

export async function createCar(input: CarInput): Promise<{ id: string }>
export async function updateCar(id: string, input: CarInput): Promise<void>
export async function deleteCar(id: string): Promise<{ softDeleted: boolean }>
export async function toggleCarFeatured(id: string): Promise<void>
export async function reorderCars(orderedIds: string[]): Promise<void>

// src/server/admin/upload.actions.ts
"use server";

export async function createUploadToken(
  meta: { filename: string; mime: string; size: number; folder: string }
): Promise<UploadTokenResult>
```

### Contrat commun
Chaque action :
1. `"use server"` au sommet du fichier
2. `await requireAdminSessionOrRedirect()` en premier
3. Zod parse de l'input → throw `ValidationError` si échec
4. Opération Prisma (transaction si plusieurs écritures)
5. `revalidatePath("/admin/cars")` + `revalidatePath("/cars")` + `revalidatePath("/")` selon impact
6. Return value ou throw `ActionError` avec message utilisateur

### Types d'erreur
```ts
class ActionError extends Error {
  constructor(public userMessage: string, public code?: string) { ... }
}
```
Le client catche et affiche `userMessage` via toast. Pas de stack trace côté utilisateur.

---

## 11. Schéma zod (source de vérité)

```ts
// src/server/admin/cars.schema.ts
export const featureSchema = z.object({
  title: z.string().min(3).max(60),
  body: z.string().min(10).max(300),
});

export const carFormSchema = z.object({
  brand: z.string().min(2).max(50),
  model: z.string().min(1).max(50),
  trim: z.string().max(60).nullable(),
  year: z.number().int().min(1990).max(2030),
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(80),
  category: z.enum(CarCategory),
  shortTagline: z.string().max(150).nullable(),

  power: z.number().int().min(40).max(1500),
  transmission: z.enum(Transmission),
  fuelType: z.enum(FuelType),
  seats: z.number().int().min(2).max(9),
  doors: z.number().int().min(2).max(5),

  pricePerDay: z.number().positive().max(100000),
  pricePerKm: z.number().positive().max(100).nullable(),
  includedKmPerDay: z.number().int().positive().max(10000).nullable(),
  weekendPackagePrice: z.number().positive().max(100000).nullable(),
  weekendPackageIncludedKm: z.number().int().positive().max(10000).nullable(),
  depositAmount: z.number().positive().max(1000000),

  minDriverAge: z.number().int().min(18).max(99),
  minLicenseYears: z.number().int().min(0).max(50),

  description: z.string().min(50).max(2000),
  highlights: z.array(z.string().min(3).max(80)).max(8),
  features: z.array(featureSchema).max(10),

  mainImage: z.url(),
  galleryImages: z.array(z.url()).max(12),
  videoUrl: z.url().nullable(),

  status: z.enum(CarStatus),
  isFeatured: z.boolean(),
  displayOrder: z.number().int().min(0).max(9999),
});

export type CarInput = z.infer<typeof carFormSchema>;
```

---

## 12. Gestion des erreurs

| Source | Capture | UX |
|---|---|---|
| Validation zod (client) | react-hook-form | Message sous champ, scroll |
| Validation zod (serveur) | ActionError "Données invalides" | Toast + log serveur |
| Slug non-unique (Prisma P2002) | ActionError "Ce slug est déjà utilisé" | Toast, focus slug |
| Foreign key (delete) | Détection count bookings | Bascule auto en soft-delete, info dialog |
| Upload rejeté (mime/size) | Validation pré-token | Toast immédiat |
| Blob upload network | Catch promise | Toast "Erreur upload, réessayez" |
| Session expirée | redirect dans action | Page login |
| Erreur inconnue | Boundary `error.tsx` | Page erreur admin avec bouton "Retour au tableau" |

---

## 13. Migration / nettoyage

### À supprimer
- `src/components/admin/create-car-form.tsx` (placeholder)
- `src/components/admin/car-status-actions.tsx` (actions remplacées dans la liste)
- `src/app/admin/layout.tsx` actuel (recréé dans route group)
- `src/app/admin/page.tsx` actuel (redirection gérée via layout)
- `src/app/admin/dashboard/page.tsx` actuel (remplacé par placeholder pro)
- `src/app/admin/cars/page.tsx` actuel (recréé dans route group)
- `src/app/api/admin/cars/route.ts` + `src/app/api/admin/cars/[id]/route.ts` (remplacés par Server Actions)

### À conserver inchangé
- Autres pages admin `/admin/bookings`, `/admin/clients`, `/admin/blocked-dates` — restent sous l'ancien layout jusqu'aux specs suivants
- Leurs API routes `/api/admin/bookings/*`, `/api/admin/blocked-dates/*` — inchangées
- Helpers `requireAdminSession`, `validateCsrf`, `useCsrfToken` — réutilisés ailleurs
- Middleware global — seule la partie `/admin/*` gate est retirée, le reste (CSRF cookie) reste

### Coexistence transitoire
Le nouveau shell vit sous `(admin)` route group : URLs identiques (`/admin/cars`), layout différent selon la route.
- `/admin/cars` → nouveau shell via `(admin)/cars`
- `/admin/bookings` → ancien shell via `admin/bookings`

Next.js gère la priorité du route group automatiquement. Quand les autres modules seront refaits, on les migrera un par un puis on supprimera l'ancien `src/app/admin/layout.tsx`.

---

## 14. Dépendances npm

### À ajouter
- `@vercel/blob` — upload images
- `@dnd-kit/core` + `@dnd-kit/sortable` — reorder drag&drop

### Déjà installées (confirmées)
- `react-hook-form`
- `zod`
- `@hookform/resolvers`
- `date-fns`

---

## 15. Variables d'environnement

### À ajouter
- `BLOB_READ_WRITE_TOKEN` — token Vercel Blob (créé sur vercel.com > Storage > Blob store)
  - Dev : token dev store
  - Prod : token prod store

À ajouter dans `.env.example` avec commentaire explicatif.

---

## 16. Acceptance criteria

1. **Admin connecté** peut créer une 4e voiture avec mainImage + 2 galerie + 3 features + tous les champs requis → elle apparaît immédiatement sur `/admin/cars` et sur `/cars` public dans l'ordre attendu.
2. **Admin** peut éditer la Clio 6 existante, changer `pricePerDay` de 34.99 à 35 → reflété instantanément sur `/cars/[id]` public et sur le calcul booking-form (pas de cache obsolète).
3. **Admin** peut toggle `isFeatured` sur 2 voitures via le switch inline → homepage `/` affiche ces 2 voitures dans la section featured.
4. **Admin** peut réordonner les voitures par drag&drop de la ligne → ordre affiché correspond exactement sur `/cars` public.
5. **Admin** tente de supprimer la Clio 6 qui a 1 booking existant → dialog indique "désactivée, réservations conservées" → clic confirme → Clio 6 passe en `DISABLED`, disparaît du catalogue public, `/admin/cars` la montre avec pastille rouge.
6. **Admin** tente de supprimer une voiture sans aucun booking → dialog indique "supprimée définitivement" → clic confirme → voiture disparaît totalement (hard delete).
7. **Upload** : fichier `.pdf` refusé côté client (toast immédiat) ; fichier image 10 Mo refusé côté serveur ; fichier image 3 Mo accepté et visible en preview immédiatement.
8. **Accès non-admin** : utilisateur non connecté accédant à `/admin/cars` → redirect `/admin/login`. Utilisateur `USER` connecté accédant à `/admin/cars` → redirect `/admin/login`.
9. **Feedback** : toutes les actions (save/delete/toggle/reorder) déclenchent un toast immédiat (succès ou erreur) et reflètent le nouvel état sans F5 manuel.
10. **Slug unique** : créer une voiture avec un slug déjà existant → erreur claire "Ce slug est déjà utilisé", focus sur le champ slug, pas de perte de données du formulaire.
11. **Validation** : soumettre le form avec `description` vide → erreur sous le champ description + scroll automatique vers ce champ.
12. **Responsive** : `/admin/cars` lisible sur écran 1280px+ ; sur mobile (< 768px) la sidebar devient drawer et le tableau cars devient liste de cards.

---

## 17. Notes d'implémentation

### Ordre recommandé
1. Helpers (`admin-auth.ts`, `slugify.ts`, `blob.ts`)
2. Schéma zod partagé (`cars.schema.ts`)
3. Primitives UI (Button, Input, Field, Toast, ConfirmDialog)
4. Shell admin (layout, sidebar, topbar, user-menu)
5. Dashboard placeholder
6. Primitives complexes (ImagePicker, MediaGallery, TagsInput, FeaturesEditor)
7. Upload Server Action + client helper
8. Server Actions cars (create/update/delete/toggle/reorder)
9. Page liste (tableau + filtres + reorder + toggle + delete)
10. Page new + edit (form partagé)
11. Nettoyage ancien code
12. Vérifications manuelles complètes

### Décisions prises
- **Vercel Blob** vs Cloudinary : Vercel Blob — setup trivial, pas de transformation image nécessaire côté serveur (Next.js Image s'en charge).
- **Server Actions** vs API routes : Server Actions — typage, CSRF géré, moins de code.
- **@dnd-kit** vs react-beautiful-dnd : @dnd-kit — activement maintenu, accessible, SSR-safe.
- **Toast/Modal maison** vs Radix : maison — le besoin est minimal, Radix apporte ~80 kB de deps.
- **react-hook-form** : retenu — déjà utilisé dans booking-form, zodResolver propre.
