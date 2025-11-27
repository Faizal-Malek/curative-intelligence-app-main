-- Add storage tracking fields to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "storageUsed" BIGINT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "storageLimit" BIGINT NOT NULL DEFAULT 1073741824; -- 1GB in bytes

-- Add media fields to ContentIdea table
ALTER TABLE "ContentIdea"
ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT,
ADD COLUMN IF NOT EXISTS "fileSize" BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "mimeType" TEXT;

-- Update storage limits based on plan
UPDATE "User" SET "storageLimit" = 1073741824 WHERE "plan" = 'free'; -- 1GB
UPDATE "User" SET "storageLimit" = 5368709120 WHERE "plan" = 'basic'; -- 5GB
UPDATE "User" SET "storageLimit" = 21474836480 WHERE "plan" = 'pro'; -- 20GB
UPDATE "User" SET "storageLimit" = 9223372036854775807 WHERE "plan" = 'enterprise'; -- Unlimited (max BigInt)
