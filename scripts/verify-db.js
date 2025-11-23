const { Client } = require('pg')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  try {
    console.log('Connecting using DATABASE_URL...')
    await client.connect()
    console.log('Connected!')
    const { rows } = await client.query('select now() as now')
    console.log('Server time:', rows[0].now)
  } catch (err) {
    console.error('Connection failed:', err)
  } finally {
    await client.end().catch(() => {})
  }
}

main()
