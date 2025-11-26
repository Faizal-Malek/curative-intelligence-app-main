-- =====================================================
-- PERFORMANCE OPTIMIZATION: ADD MISSING INDEXES
-- Run this in Supabase SQL Editor for faster queries
-- 
-- IMPORTANT: Run each CREATE INDEX statement ONE AT A TIME
-- (Supabase SQL Editor doesn't support CONCURRENTLY in transactions)
-- =====================================================

-- Add index on User.email for faster lookups (if not already exists)
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- Add index on User.clerkId for faster auth lookups (should already have unique index)
-- The unique index User_clerkId_key already serves this purpose

-- Add index on Post.userId for faster user post queries
CREATE INDEX IF NOT EXISTS "Post_userId_idx" ON "Post"("userId");

-- Add index on Post.status for faster status queries
CREATE INDEX IF NOT EXISTS "Post_status_idx" ON "Post"("status");

-- Add composite index for Post userId + status (most common query pattern)
CREATE INDEX IF NOT EXISTS "Post_userId_status_idx" ON "Post"("userId", "status");

-- Add index on ContentIdea.userId for faster vault queries
CREATE INDEX IF NOT EXISTS "ContentIdea_userId_idx" ON "ContentIdea"("userId");

-- Add index on GenerationBatch.userId for faster batch queries
CREATE INDEX IF NOT EXISTS "GenerationBatch_userId_idx" ON "GenerationBatch"("userId");

-- Add index on GenerationBatch userId + status for common queries
CREATE INDEX IF NOT EXISTS "GenerationBatch_userId_status_idx" ON "GenerationBatch"("userId", "status");

-- Add index on Notification userId + isRead for unread count queries
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- Add index on SupportTicket userId + status for ticket queries
CREATE INDEX IF NOT EXISTS "SupportTicket_userId_status_idx" ON "SupportTicket"("userId", "status");

-- Verify indexes were created
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('User', 'Post', 'ContentIdea', 'GenerationBatch', 'Notification', 'SupportTicket')
ORDER BY tablename, indexname;

-- =====================================================
-- DONE! ✅
-- All performance indexes created
-- Note: CONCURRENTLY means indexes are built without locking tables
-- =====================================================
