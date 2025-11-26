-- =====================================================
-- RUN THESE MIGRATIONS IN SUPABASE SQL EDITOR
-- Support Chat & Notifications System
-- =====================================================

-- Add TicketMessage table for chat functionality
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

-- Add foreign key for TicketMessage -> SupportTicket
ALTER TABLE "TicketMessage" ADD CONSTRAINT "TicketMessage_ticketId_fkey" 
  FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "TicketMessage_ticketId_createdAt_idx" ON "TicketMessage"("ticketId", "createdAt");

-- Add readAt column to Notification (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Notification' AND column_name = 'readAt'
  ) THEN
    ALTER TABLE "Notification" ADD COLUMN "readAt" TIMESTAMP(3);
  END IF;
END $$;

-- =====================================================
-- DONE! ✅
-- Run npx prisma generate after this
-- =====================================================
