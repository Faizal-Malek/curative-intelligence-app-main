-- =====================================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- Copy and paste this entire script into Supabase SQL Editor
-- Run it all at once
-- =====================================================

-- =====================================================
-- SECTION 1: CREATE ENUMS
-- =====================================================

DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'OWNER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE', 'DELETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID', 'OVERDUE', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'ADMIN_MESSAGE', 'ANNOUNCEMENT', 'WARNING', 'SUCCESS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- SECTION 2: ADD MISSING COLUMNS TO USER TABLE
-- =====================================================

-- Basic user fields
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "company" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT;

-- Add enum columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" "UserRole" DEFAULT 'USER';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" "UserStatus" DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "loginCount" INTEGER DEFAULT 0;

-- Payment tracking
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" DEFAULT 'UNPAID';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastPaymentDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "nextPaymentDue" TIMESTAMP(3);

-- Navigation permissions (JSON field)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "allowedNavigation" JSONB DEFAULT '["dashboard","calendar","vault","analytics","profile","pricing","settings","support"]'::jsonb;

-- Update existing users to have default values
UPDATE "User" SET "role" = 'USER' WHERE "role" IS NULL;
UPDATE "User" SET "status" = 'ACTIVE' WHERE "status" IS NULL;
UPDATE "User" SET "loginCount" = 0 WHERE "loginCount" IS NULL;
UPDATE "User" SET "paymentStatus" = 'UNPAID' WHERE "paymentStatus" IS NULL;
UPDATE "User" SET "allowedNavigation" = '["dashboard","calendar","vault","analytics","profile","pricing","settings","support"]'::jsonb WHERE "allowedNavigation" IS NULL;

-- =====================================================
-- SECTION 3: ADD MISSING COLUMNS TO POST TABLE
-- =====================================================

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

-- =====================================================
-- SECTION 4: CREATE NOTIFICATION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX IF NOT EXISTS "Notification_isRead_idx" ON "Notification"("isRead");

-- =====================================================
-- SECTION 5: CREATE SUPPORT TICKET TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS "SupportTicket" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
    "adminNotes" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SupportTicket_userId_idx" ON "SupportTicket"("userId");
CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status");
CREATE INDEX IF NOT EXISTS "SupportTicket_priority_idx" ON "SupportTicket"("priority");

-- =====================================================
-- SECTION 6: CREATE ACTIVITY LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ActivityLog_action_idx" ON "ActivityLog"("action");

-- =====================================================
-- SECTION 7: CREATE SYSTEM METRICS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS "SystemMetrics" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "date" TIMESTAMP(3) NOT NULL UNIQUE,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "SystemMetrics_date_idx" ON "SystemMetrics"("date");

-- =====================================================
-- SECTION 8: ADD MISSING ENUMS & COLUMNS (NO SEED DATA)
-- Use this when aligning an existing database to the Prisma schema.
-- Safe & idempotent: only adds what is absent.
-- =====================================================

-- Additional enums used in schema (only create if missing)
DO $$ BEGIN CREATE TYPE "PostStatus" AS ENUM ('AWAITING_REVIEW','IDEA_APPROVED','AWAITING_MEDIA','READY_TO_SCHEDULE','SCHEDULED','POSTED','FAILED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "ContentIdeaStatus" AS ENUM ('DRAFT','READY','SCHEDULED','ARCHIVED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "BatchStatus" AS ENUM ('PENDING','PROCESSING','COMPLETED','FAILED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "SocialMediaPlatform" AS ENUM ('INSTAGRAM','FACEBOOK','TWITTER','LINKEDIN','TIKTOK','YOUTUBE'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE "AnalyticsPeriod" AS ENUM ('DAILY','WEEKLY','MONTHLY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- User table missing columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkId" TEXT; -- will backfill then enforce NOT NULL manually later
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "plan" TEXT DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "userType" TEXT DEFAULT 'business';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingComplete" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "hasGeneratedFirstBatch" BOOLEAN DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Set existing users' onboardingComplete to true (they signed up before this flag existed)
UPDATE "User" SET "onboardingComplete" = true WHERE "onboardingComplete" = false AND "createdAt" < NOW() - INTERVAL '1 hour';

-- Ensure clerkId uniqueness if present
DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='User_clerkId_key') THEN
                CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");
        END IF;
END $$;

-- Post table missing columns
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "batchId" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "status" "PostStatus" DEFAULT 'AWAITING_REVIEW';
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "likes" INTEGER DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "comments" INTEGER DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "reach" INTEGER DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "postedAt" TIMESTAMP(3);
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- GenerationBatch table
CREATE TABLE IF NOT EXISTS "GenerationBatch" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GenerationBatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ContentIdea table
CREATE TABLE IF NOT EXISTS "ContentIdea" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "batchId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "status" "ContentIdeaStatus" NOT NULL DEFAULT 'DRAFT',
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentIdea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ContentTemplate table
CREATE TABLE IF NOT EXISTS "ContentTemplate" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "structure" JSONB DEFAULT '{}'::jsonb,
    "metadata" JSONB DEFAULT '{}'::jsonb,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- BrandProfile table
CREATE TABLE IF NOT EXISTS "BrandProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL UNIQUE,
    "brandName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "brandDescription" TEXT NOT NULL,
    "brandVoiceDescription" TEXT NOT NULL,
    "primaryGoal" TEXT NOT NULL,
    "doRules" TEXT,
    "dontRules" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrandProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- InfluencerProfile table
CREATE TABLE IF NOT EXISTS "InfluencerProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL UNIQUE,
    "displayName" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "contentStyle" TEXT NOT NULL,
    "doRules" TEXT,
    "dontRules" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InfluencerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Reminder table
CREATE TABLE IF NOT EXISTS "Reminder" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'reminder',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- JobQueue table
CREATE TABLE IF NOT EXISTS "JobQueue" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "attempts" INT NOT NULL DEFAULT 0,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- EmailOtp table
CREATE TABLE IF NOT EXISTS "EmailOtp" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL UNIQUE,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INT NOT NULL DEFAULT 0,
    "sendCount" INT NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SocialMediaAccount table
CREATE TABLE IF NOT EXISTS "SocialMediaAccount" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "platform" "SocialMediaPlatform" NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "profileImage" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSync" TIMESTAMP(3),
    "followerCount" INT,
    "pageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialMediaAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SocialMediaAccount_user_platform_key" ON "SocialMediaAccount"("userId","platform");

-- SocialMediaAnalytics table
CREATE TABLE IF NOT EXISTS "SocialMediaAnalytics" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "accountId" TEXT NOT NULL,
    "followers" INT NOT NULL DEFAULT 0,
    "following" INT NOT NULL DEFAULT 0,
    "posts" INT NOT NULL DEFAULT 0,
    "engagement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reach" INT NOT NULL DEFAULT 0,
    "impressions" INT NOT NULL DEFAULT 0,
    "period" "AnalyticsPeriod" NOT NULL DEFAULT 'DAILY',
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialMediaAnalytics_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SocialMediaAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SocialMediaAnalytics_account_period_date_key" ON "SocialMediaAnalytics"("accountId","period","date");

-- Indexes for new tables (where helpful)
CREATE INDEX IF NOT EXISTS "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId","createdAt"); -- already defined earlier but kept idempotent


-- =====================================================
-- VERIFICATION QUERIES
-- Run these to verify everything worked
-- =====================================================

-- Check User table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User' 
ORDER BY column_name;

-- Check Post table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Post' 
ORDER BY column_name;

-- Check new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('Notification', 'SupportTicket', 'ActivityLog', 'SystemMetrics');

-- =====================================================
-- DONE! ✅
-- All tables, columns, enums, and indexes created
-- =====================================================
