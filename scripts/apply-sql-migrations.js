// Applies SQL migration files using node-postgres in simple query mode to avoid prepared statements.
// Useful when Prisma migrate fails behind PgBouncer (Supabase pooled connections).

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnvVar(key) {
  if (process.env[key]) return process.env[key];
  const tryFiles = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env'),
  ];
  for (const file of tryFiles) {
    if (!fs.existsSync(file)) continue;
    const line = fs
      .readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .find((l) => new RegExp(`^\s*${key}\s*=`).test(l));
    if (line) {
      const v = line.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
      if (v) return v;
    }
  }
  return undefined;
}

async function main() {
  const DATABASE_URL = loadEnvVar('DATABASE_URL');
  if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set in env or .env/.env.local');
    process.exit(1);
  }

  // Ensure pooled URL is used (works via PgBouncer), and enable SSL.
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    simple: true, // disable prepared statements
  });

  const migrations = [
    path.join('prisma', 'migrations', '20251006_fix_user_clerkid_column', 'migration.sql'),
    path.join('prisma', 'migrations', '20251006_ensure_brandprofile_userid', 'migration.sql'),
    path.join('prisma', 'migrations', '20251006_cleanup_brandprofile_legacy_userid', 'migration.sql'),
    path.join('prisma', 'migrations', '20251006_cleanup_brandprofile_pascalcase_columns', 'migration.sql'),
    path.join('prisma', 'migrations', '20251006_add_reminder_table', 'migration.sql'),
    path.join('prisma', 'migrations', '20251006_add_user_usertype_column', 'migration.sql'),
    path.join('prisma', 'migrations', '20251006_add_influencer_profile_table', 'migration.sql'),
  ];

  try {
    await client.connect();
    for (const mig of migrations) {
      if (!fs.existsSync(mig)) {
        console.log(`Skipping missing migration: ${mig}`);
        continue;
      }
      const sql = fs.readFileSync(mig, 'utf8');
      console.log(`Applying migration: ${mig}`);
      await client.query(sql);
      console.log(`Applied: ${mig}`);
    }

    // Verify BrandProfile.userId exists
    const check = await client.query(
      `SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='BrandProfile' AND column_name='userId'`
    );
    if (check.rowCount === 1) {
      console.log('Verified: BrandProfile.userId column exists.');
    } else {
      console.warn('Warning: BrandProfile.userId column was not detected.');
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
