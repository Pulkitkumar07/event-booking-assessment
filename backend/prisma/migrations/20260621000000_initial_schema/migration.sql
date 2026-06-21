-- PostgreSQL extension used by the title search index.
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('USER', 'ORGANIZER');

-- CreateEnum
CREATE TYPE "booking_status" AS ENUM ('CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "activity_type" AS ENUM (
    'EVENT_VIEWED',
    'BOOKING_STARTED',
    'BOOKING_CONFIRMED',
    'BOOKING_CANCELLED'
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "organizer_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "venue" VARCHAR(255) NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "events_capacity_check" CHECK ("capacity" > 0),
    CONSTRAINT "events_price_check" CHECK ("price" >= 0)
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "status" "booking_status" NOT NULL DEFAULT 'CONFIRMED',
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "bookings_cancelled_at_check" CHECK (
        ("status" = 'CONFIRMED' AND "cancelled_at" IS NULL)
        OR
        ("status" = 'CANCELLED' AND "cancelled_at" IS NOT NULL)
    )
);

-- CreateTable
CREATE TABLE "activity_log" (
    "id" BIGSERIAL NOT NULL,
    "event_id" UUID NOT NULL,
    "user_id" UUID,
    "type" "activity_type" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Supports upcoming-event filtering and stable pagination.
CREATE INDEX "events_starts_at_id_idx" ON "events"("starts_at", "id");

-- Supports the organizer dashboard.
CREATE INDEX "events_organizer_id_starts_at_idx"
ON "events"("organizer_id", "starts_at");

-- Supports case-insensitive partial title search.
CREATE INDEX "events_title_trgm_idx"
ON "events" USING GIN ("title" gin_trgm_ops);

-- Supports seat counts and attendee lists.
CREATE INDEX "bookings_event_id_status_idx"
ON "bookings"("event_id", "status");

-- Supports the current user's booking list.
CREATE INDEX "bookings_user_id_status_idx"
ON "bookings"("user_id", "status");

-- Prevents a user from having multiple booking rows for one event.
CREATE UNIQUE INDEX "bookings_user_id_event_id_key"
ON "bookings"("user_id", "event_id");

-- Supports analytics grouped by activity type.
CREATE INDEX "activity_log_event_id_type_idx"
ON "activity_log"("event_id", "type");

CREATE INDEX "activity_log_event_id_created_at_idx"
ON "activity_log"("event_id", "created_at");

-- AddForeignKey
ALTER TABLE "events"
ADD CONSTRAINT "events_organizer_id_fkey"
FOREIGN KEY ("organizer_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings"
ADD CONSTRAINT "bookings_event_id_fkey"
FOREIGN KEY ("event_id") REFERENCES "events"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log"
ADD CONSTRAINT "activity_log_event_id_fkey"
FOREIGN KEY ("event_id") REFERENCES "events"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log"
ADD CONSTRAINT "activity_log_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Activity rows are analytics history, so application code cannot edit them.
CREATE FUNCTION prevent_activity_log_changes()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'activity_log is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activity_log_no_update_or_delete
BEFORE UPDATE OR DELETE ON "activity_log"
FOR EACH ROW
EXECUTE FUNCTION prevent_activity_log_changes();
