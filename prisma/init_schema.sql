-- Prisma-compatible SQL schema (simplified) for Supabase/Postgres
-- Run this in Supabase SQL Editor or psql to create tables before running prisma migrate

-- Enums
CREATE TYPE post_status AS ENUM ('AWAITING_REVIEW','IDEA_APPROVED','AWAITING_MEDIA','READY_TO_SCHEDULE','SCHEDULED','POSTED','FAILED');
CREATE TYPE batch_status AS ENUM ('PENDING','PROCESSING','COMPLETED','FAILED');

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clerkId text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  firstName text,
  lastName text,
  imageUrl text,
  plan text DEFAULT 'free',
  onboardingComplete boolean DEFAULT false,
  hasGeneratedFirstBatch boolean DEFAULT false,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

-- BrandProfile
CREATE TABLE IF NOT EXISTS "BrandProfile" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId uuid UNIQUE NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  brandName text NOT NULL,
  industry text NOT NULL,
  brandDescription text NOT NULL,
  brandVoiceDescription text NOT NULL,
  primaryGoal text NOT NULL,
  doRules text,
  dontRules text,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

-- GenerationBatch
CREATE TABLE IF NOT EXISTS "GenerationBatch" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  status batch_status DEFAULT 'PENDING',
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

-- Post
CREATE TABLE IF NOT EXISTS "Post" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  userId uuid NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  batchId uuid REFERENCES "GenerationBatch"(id) ON DELETE SET NULL,
  content text NOT NULL,
  status post_status DEFAULT 'AWAITING_REVIEW',
  mediaUrl text,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  reach integer DEFAULT 0,
  scheduledAt timestamptz,
  postedAt timestamptz,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

-- JobQueue
CREATE TABLE IF NOT EXISTS "JobQueue" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb NOT NULL,
  status text DEFAULT 'pending',
  attempts integer DEFAULT 0,
  result jsonb,
  createdAt timestamptz DEFAULT now(),
  updatedAt timestamptz DEFAULT now()
);

-- Trigger to update updatedAt timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brandprofile_updated_at BEFORE UPDATE ON "BrandProfile" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generationbatch_updated_at BEFORE UPDATE ON "GenerationBatch" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_post_updated_at BEFORE UPDATE ON "Post" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobqueue_updated_at BEFORE UPDATE ON "JobQueue" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant usage to the default public role (adjust per your RLS plan)
GRANT USAGE ON SCHEMA public TO public;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO public;
