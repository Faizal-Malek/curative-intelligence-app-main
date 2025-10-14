#!/usr/bin/env node
// Ensures Prisma always receives a valid Postgres connection string, even when
// environments expose Supabase credentials under different variable names.

const { spawn } = require('node:child_process');
const path = require('node:path');

const candidates = [
  { key: 'DATABASE_URL', value: process.env.DATABASE_URL },
  { key: 'SUPABASE_DB_URL', value: process.env.SUPABASE_DB_URL },
  { key: 'SUPABASE_POSTGRES_URL', value: process.env.SUPABASE_POSTGRES_URL },
  { key: 'SUPABASE_CONNECTION_STRING', value: process.env.SUPABASE_CONNECTION_STRING },
  { key: 'SUPABASE_DB_CONNECTION', value: process.env.SUPABASE_DB_CONNECTION },
];

const chosen = candidates.find((entry) => typeof entry.value === 'string' && entry.value.trim().length > 0);

const ciMode = process.env.CI === '1' || process.env.NODE_ENV === 'test';
const placeholderUrl = 'postgresql://postgres:postgres@localhost:5432/postgres';

let connection;
let originKey;

if (!chosen) {
  if (ciMode) {
    console.warn(
      '\n⚠️  DATABASE_URL was not provided. Using a placeholder connection string for Prisma code generation in CI.',
    );
    connection = placeholderUrl;
    originKey = 'PLACEHOLDER';
  } else {
    console.error('\n❌ Prisma generate aborted: no database connection string found.');
    console.error(
      'Set DATABASE_URL to your Supabase Postgres connection string. You can copy it from Supabase → Settings → Database.',
    );
    process.exit(1);
  }
} else {
  connection = chosen.value.trim();
  originKey = chosen.key;
}

const postgresPattern = /^postgres(?:ql)?:\/\//i;
if (!postgresPattern.test(connection)) {
  if (/^https?:\/\//i.test(connection) && connection.includes('.supabase.co')) {
    console.error('\n❌ It looks like you supplied the Supabase project URL.');
    console.error('Copy the "Connection string" under Settings → Database instead (it begins with postgresql://).');
  } else {
    console.error(`\n❌ ${originKey} must begin with "postgresql://" or "postgres://".`);
  }
  process.exit(1);
}

if (!/[?&]sslmode=/i.test(connection)) {
  connection += connection.includes('?') ? '&sslmode=require' : '?sslmode=require';
}

if (originKey !== 'DATABASE_URL') {
  console.info(`\nℹ️  Using ${originKey} for Prisma. Forwarding it as DATABASE_URL with sslmode=require.`);
} else if (connection !== chosen.value.trim()) {
  console.info('\nℹ️  Normalised DATABASE_URL by appending sslmode=require for Supabase.');
}

const prismaBin = path.join('node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
const child = spawn(prismaBin, ['generate'], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: connection },
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
