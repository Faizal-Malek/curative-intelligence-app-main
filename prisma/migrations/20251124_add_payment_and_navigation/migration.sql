-- AlterTable
ALTER TABLE "User" ADD COLUMN "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID';
ALTER TABLE "User" ADD COLUMN "lastPaymentDate" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "nextPaymentDue" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "allowedNavigation" JSONB DEFAULT '["dashboard","calendar","vault","analytics","profile","pricing","settings","support"]';

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'UNPAID', 'OVERDUE', 'CANCELLED');

-- AlterTable: Update existing column to use enum
ALTER TABLE "User" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus" USING "paymentStatus"::"PaymentStatus";

-- Set default payment due dates for paid users with pro/enterprise plans
UPDATE "User" 
SET "nextPaymentDue" = NOW() + INTERVAL '30 days'
WHERE "plan" IN ('pro', 'enterprise') AND "paymentStatus" = 'UNPAID';
