#!/usr/bin/env node
const { Client } = require('pg')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function processJob(jobId) {
  const job = await prisma.jobQueue.findUnique({ where: { id: jobId } })
  if (!job) return
  if (job.status !== 'pending') return

  try {
    await prisma.jobQueue.update({ where: { id: jobId }, data: { status: 'processing', attempts: job.attempts + 1 } })
    if (job.type === 'generate') {
      const payload = job.payload
      console.log('Processing generation job for batch', payload.batchId)
      await prisma.jobQueue.update({ where: { id: jobId }, data: { status: 'completed', result: { ok: true } } })
    }
  } catch (err) {
    console.error('Job processing failed', err)
    await prisma.jobQueue.update({ where: { id: jobId }, data: { status: 'failed' } })
  }
}

async function start() {
  const client = new Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  client.on('notification', async (msg) => {
    try {
      const jobId = msg.payload
      if (jobId) await processJob(jobId)
    } catch (err) {
      console.error('Notification handler error', err)
    }
  })
  await client.query('LISTEN jobs')
  console.log('Worker listening for jobs...')
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
