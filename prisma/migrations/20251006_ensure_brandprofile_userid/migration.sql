-- Ensure BrandProfile table and userId column/constraints exist
-- Fixes: P2022 "The column `userId` does not exist in the current database."

-- Enable pgcrypto for gen_random_uuid() if needed
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create table if missing (Prisma model uses a quoted name "BrandProfile")
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'BrandProfile'
  ) THEN
    CREATE TABLE "BrandProfile" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "userId" uuid,
      "brandName" text NOT NULL,
      "industry" text NOT NULL,
      "brandDescription" text NOT NULL,
      "brandVoiceDescription" text NOT NULL,
      "primaryGoal" text NOT NULL,
      "doRules" text,
      "dontRules" text,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    );
  END IF;
END $$;

-- Ensure all expected columns exist (id, userId, fields)
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "id" uuid DEFAULT gen_random_uuid();
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "userId" uuid;
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "brandName" text;
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "industry" text;
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "brandDescription" text;
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "brandVoiceDescription" text;
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "primaryGoal" text;
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "doRules" text;
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "dontRules" text;
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT now();
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- Ensure correct types for id and userId (convert from text to uuid if needed)
DO $$
BEGIN
  -- id column type fix
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'BrandProfile' AND column_name = 'id' AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE "BrandProfile"
    ALTER COLUMN "id" TYPE uuid USING "id"::uuid;
  END IF;

  -- userId column type fix
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'BrandProfile' AND column_name = 'userId' AND data_type <> 'uuid'
  ) THEN
    ALTER TABLE "BrandProfile"
    ALTER COLUMN "userId" TYPE uuid USING NULLIF("userId", '')::uuid;
  END IF;
END $$;

-- Promote id to PK if not set
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'BrandProfile' AND constraint_type = 'PRIMARY KEY'
  ) THEN
    ALTER TABLE "BrandProfile"
    ADD CONSTRAINT "BrandProfile_pkey" PRIMARY KEY ("id");
  END IF;
END $$;

-- Unique index on userId (as per Prisma @unique)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'BrandProfile_userId_key'
  ) THEN
    CREATE UNIQUE INDEX "BrandProfile_userId_key" ON "BrandProfile" ("userId");
  END IF;
END $$;

-- Foreign key to User(id) (ON DELETE CASCADE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'BrandProfile' AND constraint_name = 'BrandProfile_userId_fkey'
  ) THEN
    ALTER TABLE "BrandProfile" ADD CONSTRAINT "BrandProfile_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
