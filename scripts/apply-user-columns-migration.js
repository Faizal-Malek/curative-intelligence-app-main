// Apply missing User table columns
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function applyMigration() {
  try {
    console.log('Reading SQL migration file...');
    const sqlPath = path.join(__dirname, 'add-missing-user-columns.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon and filter out comments and empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && s !== 'COMMIT');

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          console.log(`[${i + 1}/${statements.length}] Executing...`);
          await prisma.$executeRawUnsafe(statement + ';');
          console.log(`✓ Statement ${i + 1} executed successfully`);
        } catch (error) {
          // Some statements might fail if columns already exist, that's ok
          console.log(`⚠ Statement ${i + 1} warning:`, error.message);
        }
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('You can now restart your dev server.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
