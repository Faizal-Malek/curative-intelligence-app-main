-- Adds a nullable `clerkId` column and a unique index (allows multiple NULLs).
-- Safe to run on existing databases.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkId" text;
CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");

