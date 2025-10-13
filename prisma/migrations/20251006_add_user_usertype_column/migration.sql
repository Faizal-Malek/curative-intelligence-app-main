-- Adds userType column to User to persist onboarding choice
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "userType" text NOT NULL DEFAULT 'business';
-- Optional: simple index for filtering by type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='User_userType_idx') THEN
    CREATE INDEX "User_userType_idx" ON "User" ("userType");
  END IF;
END $$;
