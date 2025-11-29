-- Align the User.role column with the UserRole enum expected by the Prisma schema.
-- Existing data only contains USER/ADMIN/OWNER values, so casting is safe.
UPDATE "User" SET "role" = 'USER' WHERE "role" IS NULL;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
