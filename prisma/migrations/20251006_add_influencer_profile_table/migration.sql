-- Create InfluencerProfile table with 1:1 relation to User
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'InfluencerProfile'
  ) THEN
    CREATE TABLE "InfluencerProfile" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" uuid NOT NULL,
      "displayName" text NOT NULL,
      "niche" text NOT NULL,
      "bio" text NOT NULL,
      "contentStyle" text NOT NULL,
      "doRules" text,
      "dontRules" text,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- Ensure unique userId and FK
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'InfluencerProfile_userId_key'
  ) THEN
    ALTER TABLE "InfluencerProfile" ADD CONSTRAINT "InfluencerProfile_userId_key" UNIQUE ("userId");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='InfluencerProfile' AND constraint_name='InfluencerProfile_userId_fkey'
  ) THEN
    ALTER TABLE "InfluencerProfile" ADD CONSTRAINT "InfluencerProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='InfluencerProfile_userId_idx') THEN
    CREATE INDEX "InfluencerProfile_userId_idx" ON "InfluencerProfile" ("userId");
  END IF;
END $$;
