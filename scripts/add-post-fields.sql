-- Add missing fields to Post table for AI-generated content
-- Copy and paste this script into Supabase SQL Editor

-- Add platform field
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "platform" TEXT DEFAULT 'instagram';

-- Add caption field (separate from content for flexibility)
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "caption" TEXT;

-- Add hashtags array
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "hashtags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add mentions array
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "mentions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add AI generation flag
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "aiGenerated" BOOLEAN DEFAULT false;

-- Add metadata JSON for storing additional context
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT '{}'::jsonb;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "Post_platform_idx" ON "Post"("platform");
CREATE INDEX IF NOT EXISTS "Post_aiGenerated_idx" ON "Post"("aiGenerated");
CREATE INDEX IF NOT EXISTS "Post_status_userId_idx" ON "Post"("status", "userId");

-- Update existing posts to have default values
UPDATE "Post" SET "platform" = 'instagram' WHERE "platform" IS NULL;
UPDATE "Post" SET "hashtags" = ARRAY[]::TEXT[] WHERE "hashtags" IS NULL;
UPDATE "Post" SET "mentions" = ARRAY[]::TEXT[] WHERE "mentions" IS NULL;
UPDATE "Post" SET "aiGenerated" = false WHERE "aiGenerated" IS NULL;
UPDATE "Post" SET "metadata" = '{}'::jsonb WHERE "metadata" IS NULL;

-- DONE! Post table enhanced for AI-generated content
