-- Fix potential case-sensitivity/column mismatch between clerkId and clerkid
-- Common issue on Postgres when an unquoted column clerkId (lowercased to clerkid)
-- exists alongside a quoted "clerkId" used by Prisma.
--
-- Steps:
-- 1) Add the correctly cased column if missing
-- 2) Backfill from legacy clerkid if present
-- 3) Enforce NOT NULL and unique (if your model requires it)
-- 4) Drop the legacy column and conflicting indexes

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkId" text;

-- Backfill from a mistakenly created lowercase column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'clerkid'
  ) THEN
    UPDATE "User" SET "clerkId" = COALESCE("clerkId", (SELECT "User".clerkid)) WHERE "clerkId" IS NULL;
  END IF;
END $$;

-- Ensure unique index (allows multiple NULLs, which is fine)
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");

-- Optionally set NOT NULL if you want to enforce presence going forward (comment out if not ready)
-- ALTER TABLE "User" ALTER COLUMN "clerkId" SET NOT NULL;

-- Drop the legacy column if it exists to avoid future confusion
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User' AND column_name = 'clerkid'
  ) THEN
    ALTER TABLE "User" DROP COLUMN clerkid;
  END IF;
END $$;
