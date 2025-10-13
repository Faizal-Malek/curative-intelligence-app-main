-- Safe migration to align the existing "User" table with the Prisma model
-- This fixes errors like: PrismaClientKnownRequestError P2022 (column does not exist)

-- Add profile-related columns if they are missing
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" text;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imageUrl" text;

-- Plan and onboarding flags
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" text DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingComplete" boolean DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasGeneratedFirstBatch" boolean DEFAULT false;

-- Timestamps (Prisma will manage updatedAt when present)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" timestamptz DEFAULT now();
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz DEFAULT now();

-- Ensure indexes exist (no-op if already created)
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");

-- Optional: backfill plan/onboarding defaults for existing rows that are NULL
UPDATE "User" SET "plan" = 'free' WHERE "plan" IS NULL;
UPDATE "User" SET "onboardingComplete" = false WHERE "onboardingComplete" IS NULL;
UPDATE "User" SET "hasGeneratedFirstBatch" = false WHERE "hasGeneratedFirstBatch" IS NULL;
