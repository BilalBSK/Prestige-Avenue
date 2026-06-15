# Calendrier de réservation — grisage des périodes indisponibles

**Date :** 2026-06-16
**Statut :** validé

## Problème

Dans le drawer de réservation public (`BookingRequestSheet` → `BookingStepDates` →
`BookingCalendar`), le calendrier ne grise que les jours **hors fenêtre** (horizon 2
mois). Il ignore totalement les réservations existantes. La disponibilité n'est
vérifiée qu'*après* la sélection d'une plage, via l'appel debouncé à
`/api/cars/[id]/availability`. Conséquence : un client peut choisir une période déjà
prise et ne découvrir le conflit qu'à la dernière étape — aucune indication visuelle
ne l'oriente vers les dates libres.

## Objectif

Griser, directement dans le calendrier, les jours déjà **réservés et confirmés**
(`CONFIRMED` / `IN_PROGRESS`) ou **bloqués** par l'agence (`BlockedDate`), pour que le
client voie d'un coup d'œil les périodes possibles. Les demandes en attente
(`PENDING_REVIEW`) ne bloquent PAS — cohérent avec la règle métier existante
(`BLOCKING_STATUSES`), l'agence arbitre manuellement les conflits.

## Décisions de design (validées)

- **Rendu d'un jour indisponible :** hachures diagonales fines + chiffre estompé,
  non cliquable. Monochrome, sobre, cohérent avec la direction « dark luxury ».
- **Plage qui enjamberait une indispo :** désactivation intelligente (façon
  Airbnb/Booking). Une fois la date de début choisie, toute date au-delà de la
  prochaine période bloquée devient non-sélectionnable comme fin. L'erreur « à
  cheval » devient impossible par construction.

## Architecture

### 1. Service — `getUnavailableRanges`

`src/services/booking.service.ts` :

```
getUnavailableRanges(carId, from, to): Promise<{ start: string; end: string }[]>
```

- Requête en parallèle : `booking` (status ∈ `BLOCKING_STATUSES`, chevauchant
  `[from, to)`) + `blockedDate` (chevauchant `[from, to)`).
- Normalise chaque segment en `{ start, end }` au format `YYYY-MM-DD` (UTC, via les
  helpers `calendar-date`). `end` est **exclusif** (jour de restitution), cohérent
  avec toute la logique d'overlap demi-ouverte du projet.
- Fusionne les segments qui se chevauchent/se touchent en intervalles disjoints
  (tri par début + coalescence) pour un payload minimal et un calcul client trivial.
- Réutilise `BLOCKING_STATUSES` déjà exporté localement.

### 2. Route — `GET /api/cars/[id]/unavailable`

`src/app/api/cars/[id]/unavailable/route.ts` :

- Publique (pas de garde admin), `cache: no-store`.
- Params optionnels `from` / `to` (YYYY-MM-DD). Défaut : aujourd'hui →
  aujourd'hui + 2 mois + marge, soit la fenêtre sélectionnable du calendrier.
- Réponse `{ ranges: [{ start, end }] }`. En cas d'erreur : `{ ranges: [] }` (statut
  200) — un échec ne doit jamais empêcher de réserver ; le garde-fou ultime reste la
  transaction serveur `assertNoOverlap`.

### 3. UI — propagation + rendu

- **`BookingRequestSheet`** : charge les plages **une fois à l'ouverture** du drawer
  (effet sur `open`), stocke `{ ranges, loading, failed }`, transmet à
  `BookingStepDates` → `BookingCalendarModal` → `BookingCalendar`.
- **`BookingCalendar`** :
  - `isUnavailable(day)` : `day` ∈ `[start, end)` d'une plage. Le jour `end`
    (restitution) reste libre — règle hôtelière standard, déjà admise côté serveur.
  - Jour indisponible → hachures CSS (`repeating-linear-gradient`), chiffre estompé,
    `disabled` + `aria-disabled`, `aria-label` « … indisponible ».
  - **Plafond intelligent** : après le choix du début `S`, calcul du 1ᵉʳ jour occupé
    `F ≥ S`. Toute date `> F` est non-sélectionnable comme fin (`F` reste
    sélectionnable comme restitution). La bande de sélection survol/active ne dépasse
    jamais `F`.
  - **Légende** : un échantillon hachuré + « Indisponible ».
  - **Chargement** : léger shimmer sur la grille.
  - **Erreur de fetch** : repli silencieux sur sélection libre.

## Hors périmètre (YAGNI)

- Pas de grisage des règles métier (motif week-end, 1 jour, fenêtre) — déjà couvert
  par le message d'état + le serveur ; sujet distinct.
- Pas de temps réel (websocket/polling) : un fetch à l'ouverture suffit à ce volume.
- Le check post-sélection (`/availability`) + le message d'état sont **conservés**
  comme filet de sécurité.

## Accessibilité

- Hachures = indice visuel, doublé par `disabled`/`aria-disabled` et le libellé (pas
  de sens porté par la seule couleur).
- Contraste du chiffre estompé ≥ 3:1.
- `prefers-reduced-motion` : pas de shimmer animé.
