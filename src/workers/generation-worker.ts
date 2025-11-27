/**
 * Generation Worker
 * - Supports two strategies selected by env `QUEUE_STRATEGY`:
 *   - 'postgres' (default): LISTEN/NOTIFY via JobQueue table
 *   - 'redis': BullMQ worker on queue 'generation'
 */

import { Client } from 'pg'
import { PrismaClient } from '@prisma/client'
import { Worker as BullWorker } from 'bullmq'
import { generateWelcomeBatch as generateWithGemini } from '../services/gemini/content-generation-service'

const prisma = new PrismaClient()

type GeneratePayload = { userId: string; brandProfileId: string; batchId: string }

async function handleGenerate({ userId, brandProfileId, batchId }: GeneratePayload) {
  console.log('[Generation Worker] Processing batch', batchId)
  // Ensure batch shows processing
  await prisma.generationBatch.update({ where: { id: batchId }, data: { status: 'PROCESSING' } })
  // Delegate to generation service (sets COMPLETED/FAILED)
  await generateWithGemini(userId, brandProfileId, batchId)
}

async function processJobRow(jobId: string) {
  const job = await prisma.jobQueue.findUnique({ where: { id: jobId } })
  if (!job || job.status !== 'pending') return

  try {
    await prisma.jobQueue.update({ where: { id: jobId }, data: { status: 'processing', attempts: job.attempts + 1 } })
    if (job.type === 'generate') {
      await handleGenerate(job.payload as GeneratePayload)
    }
    await prisma.jobQueue.update({ where: { id: jobId }, data: { status: 'completed', result: { ok: true } } })
  } catch (err) {
    console.error('[Generation Worker] Job processing failed', err)
    await prisma.jobQueue.update({ where: { id: jobId }, data: { status: 'failed' } })
  }
}

async function startPostgresWorker() {
  // Prefer pooled DATABASE_URL to avoid IPv6-only direct host issues
  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
  if (!connectionString) throw new Error('DATABASE_URL or DIRECT_URL not set')
  const client = new Client({ connectionString })
  await client.connect()
  client.on('notification', async (msg) => {
    try {
      const jobId = msg.payload
      if (jobId) await processJobRow(jobId)
    } catch (err) {
      console.error('[Generation Worker] Notification handler error', err)
    }
  })
  await client.query('LISTEN jobs')
  console.log('[Generation Worker] Listening on Postgres channel "jobs"')
}

async function startRedisWorker() {
  const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  }

  const worker = new BullWorker(
    'generation',
    async (job) => {
      const payload = job.data as GeneratePayload
      await handleGenerate(payload)
    },
    { connection }
  )

  worker.on('completed', (job) => {
    console.log('[Generation Worker] Job completed', job.id)
  })
  worker.on('failed', (job, err) => {
    console.error('[Generation Worker] Job failed', job?.id, err)
  })

  console.log('[Generation Worker] BullMQ worker started')
}

const STRATEGY = process.env.QUEUE_STRATEGY || 'postgres'
;(async () => {
  if (STRATEGY === 'redis') await startRedisWorker()
  else await startPostgresWorker()
})().catch((err) => {
  console.error('[Generation Worker] Fatal', err)
  process.exit(1)
})
