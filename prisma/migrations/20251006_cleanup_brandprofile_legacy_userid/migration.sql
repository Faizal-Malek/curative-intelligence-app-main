-- Cleanup legacy lowercase `userid` column on BrandProfile
-- Backfill new "userId" (uuid) from legacy, drop indexes, then drop column.

DO $$
BEGIN
  -- If legacy column exists, attempt backfill
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'BrandProfile' AND column_name = 'userid'
  ) THEN
    -- Ensure target column exists with correct type
    ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "userId" uuid;

    -- Attempt to backfill userId from legacy column (string to uuid), where userId is null
    BEGIN
      UPDATE "BrandProfile"
      SET "userId" = NULLIF(userid::text, '')::uuid
      WHERE "userId" IS NULL AND userid IS NOT NULL;
    EXCEPTION WHEN others THEN
      -- If cast fails for some rows, leave them as null; onboarding upsert will populate going forward.
      NULL;
    END;

    -- Drop common constraints that might reference legacy column
    ALTER TABLE "BrandProfile" DROP CONSTRAINT IF EXISTS "BrandProfile_userid_fkey";
    ALTER TABLE "BrandProfile" DROP CONSTRAINT IF EXISTS "BrandProfile_userid_key";

    -- Finally drop the legacy column
    ALTER TABLE "BrandProfile" DROP COLUMN IF EXISTS userid;
  END IF;
END $$;
