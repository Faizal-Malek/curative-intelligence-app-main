-- Create Reminder table to store user reminders for calendar
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Reminder'
  ) THEN
    CREATE TABLE "Reminder" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" uuid NOT NULL,
      "title" text NOT NULL,
      "description" text,
      "startsAt" timestamptz NOT NULL,
      "endsAt" timestamptz,
      "allDay" boolean NOT NULL DEFAULT false,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- Ensure columns exist (idempotent)
ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT gen_random_uuid();
ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "userId" uuid;
ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "title" text;
ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "startsAt" timestamptz;
ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "endsAt" timestamptz;
ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "allDay" boolean DEFAULT false;
ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT now();
ALTER TABLE "Reminder" ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- PK if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='Reminder' AND constraint_type='PRIMARY KEY'
  ) THEN
    ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

-- FK to User(id) and indexes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='Reminder' AND constraint_name='Reminder_userId_fkey'
  ) THEN
    ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='Reminder_userId_idx') THEN
    CREATE INDEX "Reminder_userId_idx" ON "Reminder" ("userId");
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='Reminder_startsAt_idx') THEN
    CREATE INDEX "Reminder_startsAt_idx" ON "Reminder" ("startsAt");
  END IF;
END $$;
