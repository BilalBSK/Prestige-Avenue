-- Aligns the production schema with the post-Stripe Booking state machine.
-- Strategy: drop the BookingStatus enum cleanly because the rework already
-- truncated all existing bookings (see 20260419013439_catalog_data_model_rework
-- which DELETEs from Booking). Recreate it with the new values, then update
-- the table columns. Order matters: we cannot ALTER an enum that's referenced
-- by a column without first dropping the column or recreating the type.

-- Safety net: if any booking somehow survived, wipe them so the type swap
-- below cannot fail on stale rows. BlockedDate has no enum reference but is
-- cascade-tied to Car, untouched here.
DELETE FROM "Booking";

-- Drop columns referencing the old BookingStatus / PaymentStatus types.
ALTER TABLE "Booking"
  DROP COLUMN IF EXISTS "paymentStatus",
  DROP COLUMN IF EXISTS "stripeSessionId",
  DROP COLUMN IF EXISTS "depositDueNow",
  DROP COLUMN IF EXISTS "remainingBalance",
  DROP COLUMN IF EXISTS "status";

-- Drop the now-unreferenced enum types and recreate BookingStatus.
DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "BookingStatus";

CREATE TYPE "BookingStatus" AS ENUM (
  'PENDING_REVIEW',
  'CONFIRMED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'DECLINED'
);

-- Re-add the status column with the new default.
ALTER TABLE "Booking"
  ADD COLUMN "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_REVIEW';

-- Add new free-text columns introduced by the booking-request flow.
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "customerMessage" TEXT,
  ADD COLUMN IF NOT EXISTS "declineReason"   TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- submissionToken already exists from init, but ensure the unique index is present.
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_submissionToken_key" ON "Booking"("submissionToken");

-- Indexes used by availability / listing queries.
CREATE INDEX IF NOT EXISTS "Booking_carId_startDate_endDate_idx"
  ON "Booking"("carId", "startDate", "endDate");
CREATE INDEX IF NOT EXISTS "Booking_userId_createdAt_idx"
  ON "Booking"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Booking_status_createdAt_idx"
  ON "Booking"("status", "createdAt");

-- Index on BlockedDate for overlap queries (guard with IF NOT EXISTS in case
-- it was created out-of-band).
CREATE INDEX IF NOT EXISTS "BlockedDate_carId_startDate_endDate_idx"
  ON "BlockedDate"("carId", "startDate", "endDate");
