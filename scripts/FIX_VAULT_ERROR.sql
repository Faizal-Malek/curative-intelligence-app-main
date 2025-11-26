-- =====================================================
-- RUN THIS MIGRATION TO FIX THE VAULT ERROR
-- ContentIdea table and other missing tables will be created
-- =====================================================

-- This is the ContentIdea table that's causing the vault error
-- Run COMPLETE_DATABASE_MIGRATION.sql to fix this

-- Quick check: Does ContentIdea table exist?
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'ContentIdea'
);

-- If the above returns false, you MUST run COMPLETE_DATABASE_MIGRATION.sql
-- Location: scripts/COMPLETE_DATABASE_MIGRATION.sql

-- Copy the entire COMPLETE_DATABASE_MIGRATION.sql file
-- Paste it into Supabase SQL Editor
-- Click Run

-- This will create:
-- ✅ ContentIdea table
-- ✅ GenerationBatch table  
-- ✅ SupportTicket table
-- ✅ All missing enums
-- ✅ All missing columns
-- ✅ All indexes for performance

-- After running, the vault will work properly! 🎉
