#!/usr/bin/env node
// Small helper to enqueue a job row and signal Postgres NOTIFY so the worker picks it up.
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')
const { Client } = require('pg')

function loadDotEnv(file = path.resolve(process.cwd(), '.env')) {
  if (!fs.existsSync(file)) return
  const contents = fs.readFileSync(file, 'utf8')
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq)
    let val = line.slice(eq + 1)
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
    process.env[key] = val
  }
}

async function main() {
  loadDotEnv()
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('DATABASE_URL not set in .env')
    process.exit(2)
  }

  const prisma = new PrismaClient()
  const pg = new Client({ connectionString: DATABASE_URL })
  await pg.connect()

  // create a minimal generation batch first so payload points to a real batch (optional)
  const batch = await prisma.generationBatch.create({ data: { userId: '00000000-0000-0000-0000-000000000000' } }).catch(e => {
    // if user doesn't exist, fallback to null batch id in payload
    console.warn('Could not create generation batch (user may not exist). Proceeding with placeholder batchId.')
    return null
  })

  const payload = {
    userId: '00000000-0000-0000-0000-000000000000',
    brandProfileId: null,
    batchId: batch ? batch.id : '00000000-0000-0000-0000-000000000000'
  }

  const job = await prisma.jobQueue.create({ data: { type: 'generate', payload } })
  console.log('Created job with id', job.id)

  // Send NOTIFY so Postgres LISTEN workers pick it up
  await pg.query(`NOTIFY jobs, '${job.id}'`)
  console.log('Sent NOTIFY for job', job.id)

  await pg.end()
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
