-- =====================================================
-- COMPLETE DATABASE MIGRATION SCRIPT
-- Support Chat & Notifications System
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- Step 1: Create TicketMessage table for chat functionality
CREATE TABLE IF NOT EXISTS "TicketMessage" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "isAdmin" BOOLEAN NOT NULL DEFAULT false,
  "message" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TicketMessage_pkey" PRIMARY KEY ("id")
);

-- Step 2: Add foreign key constraint
ALTER TABLE "TicketMessage" 
ADD CONSTRAINT "TicketMessage_ticketId_fkey" 
FOREIGN KEY ("ticketId") 
REFERENCES "SupportTicket"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- Step 3: Add performance indexes
CREATE INDEX IF NOT EXISTS "TicketMessage_ticketId_createdAt_idx" 
ON "TicketMessage"("ticketId", "createdAt");

-- Step 4: Add readAt column to Notification table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'Notification' 
    AND column_name = 'readAt'
  ) THEN
    ALTER TABLE "Notification" 
    ADD COLUMN "readAt" TIMESTAMP(3);
  END IF;
END $$;

-- Step 5: Verify tables exist
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name IN ('TicketMessage', 'SupportTicket', 'Notification')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- ✅ MIGRATION COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Run: npx prisma generate (in your terminal)
-- 2. Restart your dev server
-- 3. Test support chat at /support
-- 4. Test notifications with the bell icon
-- =====================================================
