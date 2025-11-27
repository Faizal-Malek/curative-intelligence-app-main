/**
 * Simple direct PostgreSQL connectivity test with various SSL settings.
 * Run: node scripts/test-db-connection.js
 */
require('dotenv').config({ path: '.env.local' })
require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

const rawUrl = process.env.DATABASE_URL || process.env.DIRECT_URL
if (!rawUrl) {
  console.error('No DIRECT_URL or DATABASE_URL found in env.')
  process.exit(1)
}

const variants = [
  { name: 'Original string', url: rawUrl },
  { name: 'Force sslmode=require', url: rawUrl.replace(/sslmode=[^&]+/, 'sslmode=require') },
  { name: 'sslmode=require + rejectUnauthorized:false', url: rawUrl },
  // Try direct port 5432 instead of pooler 6543
  { name: 'Direct port 5432 rejectUnauthorized:false', url: rawUrl.replace(':6543/', ':5432/').replace(/pgbouncer=true&?/,'') },
]

async function testVariant(v) {
  // Add SSL config at client level for third variant only
  const useRelaxed = v.name.includes('rejectUnauthorized')
  const ssl = useRelaxed ? { rejectUnauthorized: false } : {}

  // If a CA cert is present, include it
  const caPath = process.env.NODE_EXTRA_CA_CERTS || process.env.PGSSLROOTCERT
  if (caPath && fs.existsSync(caPath)) {
    try {
      ssl.ca = fs.readFileSync(caPath, 'utf8')
      console.log(`   Using CA: ${caPath}`)
    } catch (e) {
      console.log(`   Could not read CA file at ${caPath}: ${e.message}`)
    }
  }

  const client = new Client({ connectionString: v.url, ssl: Object.keys(ssl).length ? ssl : undefined })
  const started = Date.now()
  try {
    await client.connect()
    const now = await client.query('SELECT now() as now')
    const version = await client.query('SHOW server_version')
    console.log(`\n✅ ${v.name} succeeded in ${Date.now()-started}ms`)
    console.log('   Time:', now.rows[0].now)
    console.log('   Version:', version.rows[0].server_version)
  } catch (e) {
    console.log(`\n❌ ${v.name} failed: ${e.message}`)
    if (e.stack) console.log(e.stack.split('\n').slice(0,4).join('\n'))
  } finally {
    await client.end().catch(()=>{})
  }
}

(async () => {
  console.log('🔍 Testing DB connectivity variants...')
  for (const v of variants) {
    await testVariant(v)
  }
  console.log('\nDone.')
  process.exit(0)
})()
