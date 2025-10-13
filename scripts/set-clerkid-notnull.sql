-- Run this only AFTER running scripts/backfill-clerk-id.js and verifying no NULLs remain.
ALTER TABLE "User" ALTER COLUMN "clerkId" SET NOT NULL;

