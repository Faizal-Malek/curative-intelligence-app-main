-- Manual SQL Migration for Social Media Integration
-- Run this directly in your Supabase SQL Editor if Prisma migration fails

-- Create enum types for social media platforms
CREATE TYPE "Platform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN');

-- Create SocialMediaAccount table
CREATE TABLE IF NOT EXISTS "SocialMediaAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "displayName" TEXT,
    "username" TEXT,
    "profileImage" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialMediaAccount_pkey" PRIMARY KEY ("id")
);

-- Create SocialMediaAnalytics table
CREATE TABLE IF NOT EXISTS "SocialMediaAnalytics" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "followers" INTEGER,
    "following" INTEGER,
    "posts" INTEGER,
    "engagement" DOUBLE PRECISION,
    "reach" INTEGER,
    "impressions" INTEGER,
    "saves" INTEGER,
    "shares" INTEGER,
    "comments" INTEGER,
    "likes" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialMediaAnalytics_pkey" PRIMARY KEY ("id")
);

-- Create indexes for better performance
CREATE UNIQUE INDEX IF NOT EXISTS "SocialMediaAccount_userId_platform_key" ON "SocialMediaAccount"("userId", "platform");
CREATE INDEX IF NOT EXISTS "SocialMediaAccount_platform_idx" ON "SocialMediaAccount"("platform");
CREATE INDEX IF NOT EXISTS "SocialMediaAccount_userId_idx" ON "SocialMediaAccount"("userId");
CREATE INDEX IF NOT EXISTS "SocialMediaAccount_isActive_idx" ON "SocialMediaAccount"("isActive");

CREATE INDEX IF NOT EXISTS "SocialMediaAnalytics_accountId_idx" ON "SocialMediaAnalytics"("accountId");
CREATE INDEX IF NOT EXISTS "SocialMediaAnalytics_date_idx" ON "SocialMediaAnalytics"("date");
CREATE UNIQUE INDEX IF NOT EXISTS "SocialMediaAnalytics_accountId_date_key" ON "SocialMediaAnalytics"("accountId", "date");

-- Add foreign key constraints (assuming User table exists)
-- Uncomment these lines once you verify the User table structure
-- ALTER TABLE "SocialMediaAccount" ADD CONSTRAINT "SocialMediaAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "SocialMediaAnalytics" ADD CONSTRAINT "SocialMediaAnalytics_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SocialMediaAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create a function to automatically update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for SocialMediaAccount
DROP TRIGGER IF EXISTS update_social_media_account_updated_at ON "SocialMediaAccount";
CREATE TRIGGER update_social_media_account_updated_at
    BEFORE UPDATE ON "SocialMediaAccount"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify tables were created
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('SocialMediaAccount', 'SocialMediaAnalytics')
ORDER BY table_name;