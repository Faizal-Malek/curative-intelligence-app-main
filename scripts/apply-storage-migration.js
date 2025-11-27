const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Adding storage fields to User table...');
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "storageUsed" BIGINT NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "storageLimit" BIGINT NOT NULL DEFAULT 1073741824;
    `;
    
    console.log('Adding media fields to ContentIdea table...');
    await prisma.$executeRaw`
      ALTER TABLE "ContentIdea"
      ADD COLUMN IF NOT EXISTS "mediaUrl" TEXT,
      ADD COLUMN IF NOT EXISTS "fileSize" BIGINT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
    `;
    
    console.log('Updating storage limits based on plan...');
    await prisma.$executeRaw`UPDATE "User" SET "storageLimit" = 1073741824 WHERE "plan" = 'free';`;
    await prisma.$executeRaw`UPDATE "User" SET "storageLimit" = 5368709120 WHERE "plan" = 'basic';`;
    await prisma.$executeRaw`UPDATE "User" SET "storageLimit" = 21474836480 WHERE "plan" = 'pro';`;
    await prisma.$executeRaw`UPDATE "User" SET "storageLimit" = 9223372036854775807 WHERE "plan" = 'enterprise';`;
    
    console.log('✅ Storage fields migration applied successfully');
  } catch (e) {
    console.error('❌ Migration error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
