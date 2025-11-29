-- Add RoleChange enums and tables to support owner/admin role change workflows

-- Enum for role change lifecycle
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RoleChangeStatus') THEN
    CREATE TYPE "RoleChangeStatus" AS ENUM ('PENDING','APPROVED','REJECTED','CANCELLED');
  END IF;
END$$;

-- Requests table
CREATE TABLE IF NOT EXISTS "RoleChangeRequest" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "targetUserId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "newRole" "UserRole" NOT NULL,
  "status" "RoleChangeStatus" NOT NULL DEFAULT 'PENDING',
  "reason" TEXT,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Approvals table
CREATE TABLE IF NOT EXISTS "RoleChangeApproval" (
  "id" TEXT PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  "requestId" TEXT NOT NULL,
  "approverId" TEXT NOT NULL,
  "approved" BOOLEAN NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Foreign keys
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RoleChangeRequest_targetUserId_fkey') THEN
    ALTER TABLE "RoleChangeRequest"
      ADD CONSTRAINT "RoleChangeRequest_targetUserId_fkey"
      FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RoleChangeRequest_requestedById_fkey') THEN
    ALTER TABLE "RoleChangeRequest"
      ADD CONSTRAINT "RoleChangeRequest_requestedById_fkey"
      FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RoleChangeApproval_requestId_fkey') THEN
    ALTER TABLE "RoleChangeApproval"
      ADD CONSTRAINT "RoleChangeApproval_requestId_fkey"
      FOREIGN KEY ("requestId") REFERENCES "RoleChangeRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RoleChangeApproval_approverId_fkey') THEN
    ALTER TABLE "RoleChangeApproval"
      ADD CONSTRAINT "RoleChangeApproval_approverId_fkey"
      FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END$$;

-- Indexes
CREATE INDEX IF NOT EXISTS "RoleChangeRequest_status_createdAt_idx" ON "RoleChangeRequest"("status", "createdAt");
CREATE INDEX IF NOT EXISTS "RoleChangeRequest_targetUserId_idx" ON "RoleChangeRequest"("targetUserId");
CREATE INDEX IF NOT EXISTS "RoleChangeApproval_approverId_idx" ON "RoleChangeApproval"("approverId");
CREATE UNIQUE INDEX IF NOT EXISTS "RoleChangeApproval_requestId_approverId_key" ON "RoleChangeApproval"("requestId","approverId");
