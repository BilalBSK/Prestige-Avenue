# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prestige Avenue is a luxury car rental platform built with Next.js 15 (App Router) and React 19. The UI is entirely in French. Users browse cars, book with date-based pricing, and pay a 40% deposit via Stripe Checkout. An admin panel manages fleet, bookings, clients, and blocked dates.

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
4. **Lib** (`src/lib/`) -- Pure utilities: auth config, Prisma singleton, Stripe client, CSRF helpers, booking date/pricing logic, admin permission check.

### Key Technical Details

- **Build output** goes to `.next-app/` (custom `distDir`), not the default `.next/`.
- **Tailwind CSS v4** -- configured via `@tailwindcss/postcss` plugin, theme defined CSS-first in `src/app/globals.css` using `@theme inline`. No `tailwind.config` file.
- **Database**: PostgreSQL via Prisma. Models: `User`, `Car`, `Booking`, `BlockedDate`. Enums: `Role`, `CarStatus`, `BookingStatus`, `PaymentStatus`.
- **Auth**: NextAuth.js v4 with credentials provider and JWT strategy. Admin routes are double-guarded (middleware + layout session check). Public users are auto-created during booking checkout -- there is no public login flow.
- **CSRF**: Double-submit cookie pattern. Middleware sets cookie on every request. Client components use `useCsrfToken()` hook. API routes validate `x-csrf-token` header against cookie.
- **Stripe**: Checkout Sessions for payment. Webhook at `/api/stripe/webhook` handles `checkout.session.completed/expired/failed` to update booking status. Refunds processed through admin panel.
- **Image storage**: Cloudflare R2 (S3-compatible, free egress). Admin upload flow is client-direct: browser requests a presigned PUT URL from `/api/admin/upload` (CSRF + admin guard), then PUTs the file to R2. Public reads go through the R2 public base URL configured in `R2_PUBLIC_BASE_URL`. Allowed MIMEs and 5 MB cap enforced in both `src/lib/blob.ts` and on the presign route.

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

### Booking Business Rules (`src/lib/booking.ts`)

- Pricing: weekday rate vs weekend rate per car, charged per night
- Deposit: 40% due at checkout, 60% remaining balance
- Weekend bookings must be exactly Friday to Monday (3 nights)
- 1-day bookings: Monday-Thursday only, must be booked 1-2 weeks in advance
- Maximum booking window: 2 months ahead
- Race condition protection: Prisma transactions with date overlap checking + `submissionToken` idempotency

### Route Layout

- **Public**: `/` (homepage), `/cars` (catalog), `/cars/[id]` (detail + booking form), `/booking/success`, `/booking/cancel`
- **Admin** (protected): `/admin/dashboard`, `/admin/cars`, `/admin/bookings`, `/admin/clients`, `/admin/blocked-dates`, `/admin/login`
- **API**: `/api/auth/[...nextauth]`, `/api/cars`, `/api/cars/[id]/availability`, `/api/bookings/checkout`, `/api/stripe/webhook`, `/api/admin/*`

## Environment Variables

Defined in `.env` (see `.env.example`): `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_BASE_URL`.
