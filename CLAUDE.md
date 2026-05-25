# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prestige Avenue is a luxury car rental platform built with Next.js 15 (App Router) and React 19. The UI is entirely in French. Users browse the catalog (`/cars`), open a car detail page, and submit a **booking request** through a multi-step drawer. **No online payment** — admin reviews each request, confirms (which blocks the dates) or declines (with a reason). Settlement happens offline at key handover. An admin panel manages fleet, bookings, clients, and blocked dates.

## Commands

- `npm run dev` -- start dev server
- `npm run build` -- production build
- `npm run lint` -- run ESLint
- `npx prisma migrate dev` -- apply database migrations
- `npx prisma generate` -- regenerate Prisma client after schema changes
- `npm run seed` -- seed database with test data (admin user, cars, bookings)

No test framework is configured.

## Architecture

### Layered Structure

1. **Pages** (`src/app/`) -- Next.js App Router. Mostly server components; client components for interactive forms. Path alias `@/*` maps to `src/*`.
2. **API Routes** (`src/app/api/`) -- JSON endpoints. All mutations validate CSRF tokens. Admin endpoints require `requireAdminSession()`.
3. **Services** (`src/services/`) -- Business logic decoupled from HTTP handlers (car queries, booking/availability logic, admin metrics, user registration).
4. **Lib** (`src/lib/`) -- Pure utilities: auth config, Prisma singleton, CSRF helpers, booking date/pricing logic, admin permission check, R2 client (`src/lib/r2.ts`), catalog filter parsing (`src/lib/cars/filters.ts`).

### Key Technical Details

- **Build output** goes to `.next-app/` (custom `distDir`), not the default `.next/`.
- **Tailwind CSS v4** -- configured via `@tailwindcss/postcss` plugin, theme defined CSS-first in `src/app/globals.css` using `@theme inline`. No `tailwind.config` file.
- **Database**: PostgreSQL via Prisma. Models: `User`, `Car`, `Booking`, `BlockedDate`. Enums: `Role`, `CarStatus`, `BookingStatus`, `CarCategory`, `Transmission`, `FuelType`. `Booking` has `status`, `customerMessage`, `declineReason`, `submissionToken` (no payment fields).
- **Auth**: NextAuth.js v4 with credentials provider and JWT strategy. Admin routes are double-guarded (middleware + layout session check). Public users are auto-created during booking-request submission — there is no public login flow.
- **CSRF**: Double-submit cookie pattern. Middleware sets cookie on every request. Client components use `useCsrfToken()` hook. API routes validate `x-csrf-token` header against cookie.
- **Booking flow**: No online payment. Public submits via `POST /api/bookings/request` → booking created with status `PENDING_REVIEW` (does NOT block availability). Admin transitions through the state machine in `transitionBooking` (`src/services/booking.service.ts`). Only `CONFIRMED` and `IN_PROGRESS` block dates. Race condition protection: Prisma transaction with overlap check + `submissionToken` UUID idempotency.
- **Image storage**: Cloudflare R2 (S3-compatible, free egress). Admin upload flow is client-direct: browser requests a presigned PUT URL from `/api/admin/upload` (CSRF + admin guard), then PUTs the file to R2. Public reads go through the R2 public base URL configured in `R2_PUBLIC_BASE_URL`. Allowed MIMEs and 5 MB cap enforced in both `src/lib/r2.ts` and on the presign route.

### Homepage composition

The homepage (`src/app/page.tsx`) is composed of section components under `src/components/home/`:

1. `HeroSection` — full-bleed video hero with staged entry animations
2. `ManifestoSection` — scroll-driven word-by-word highlight (`WordHighlight`)
3. `FleetSection` — 3 featured `CarCard`s with staggered reveal
4. `ProcessSection` — 3-step process with traced hairline
5. `InfoSection` — 2x2 grid of `InfoCard`s
6. `CtaSection` — final CTA with ticker-arrow button

Animations are layered:
- Entry animations (hero only) via CSS `@keyframes`, no JS
- `useRevealOnScroll` hook for scroll-triggered reveal classes (`reveal-fade-up`, `reveal-blur`, `reveal-clip`, `reveal-stagger`, `reveal-line`)
- Lenis smooth scroll mounted in root layout (disabled on touch + reduced-motion)
- `WordHighlight` component computes scroll progress to animate word colors

### Catalog & Detail page composition

- `/cars` (`src/app/cars/page.tsx`): server reads filters from URL params via `parseFiltersFromSearchParams`, fetches via `getCars` + `getAvailableBrands` in parallel. Renders `CarsHero` → `CarsToolbar` (sticky filters: price range, transmission, fuel, brands, sort) → `CarsGrid` (reveal-stagger client wrapper that re-keys on filter change) or `CarsEmptyState`.
- `/cars/[id]` (`src/app/cars/[id]/page.tsx`): server fetches the car, composes `CarDetailHero` (Ken Burns) → `CarTitleBlock` → `CarGallery` (scroll-snap horizontal) → `CarSpecs` (4 col grid) → `CarHighlights` → `CarFeatures` → `CarVideo` (YouTube/Vimeo embed) → `CarPricingPanel` → `CarCtaWithSheet`.
- `CarCtaWithSheet` is the lone client island that owns the open state for `BookingRequestSheet`. The Sheet is a 3-step drawer (Dates → Contact → Review) using the `Sheet` primitive (focus trap + backdrop) — submits to `/api/bookings/request`, then router-pushes to `/booking/confirmation/[id]`.

### Booking Business Rules (`src/lib/booking.ts`)

- Pricing: per-day rate vs weekend package per car, computed in `calculateTotalPrice`
- No deposit/installment logic — `totalPrice` is the full estimate, settled offline
- Weekend bookings must be exactly Friday → Monday (3 nights), uses `weekendPackagePrice` if defined
- 1-day bookings: Monday-Thursday only, must be booked 1–2 weeks in advance
- Maximum booking window: 2 months ahead
- BookingStatus state machine (`ALLOWED_TRANSITIONS` in `booking.service.ts`):
  - `PENDING_REVIEW` → `CONFIRMED` | `DECLINED` (decline requires reason)
  - `CONFIRMED` → `IN_PROGRESS` | `CANCELLED`
  - `IN_PROGRESS` → `COMPLETED` | `CANCELLED`
  - `COMPLETED`, `CANCELLED`, `DECLINED` are terminal
- `BLOCKING_STATUSES` for date-overlap checks: only `CONFIRMED` and `IN_PROGRESS`. `PENDING_REVIEW` does NOT block — admin manually arbitrates conflicting requests.

### Route Layout

- **Public**: `/` (homepage), `/cars` (catalog), `/cars/[id]` (detail), `/booking/confirmation/[id]`
- **Admin** (protected): `/admin/dashboard`, `/admin/cars`, `/admin/bookings`, `/admin/clients`, `/admin/blocked-dates`, `/admin/login`
- **API**: `/api/auth/[...nextauth]`, `/api/cars`, `/api/cars/[id]/availability`, `/api/bookings/request`, `/api/admin/bookings/[id]` (PATCH transition), `/api/admin/upload`, `/api/csrf`

## Environment Variables

Defined in `.env` (see `.env.example`): `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`.
