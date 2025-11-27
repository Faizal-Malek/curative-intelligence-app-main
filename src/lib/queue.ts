import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { Queue } from 'bullmq'

const prisma = new PrismaClient()

// Strategy: default to postgres LISTEN/NOTIFY. If QUEUE_STRATEGY=redis, use BullMQ.
const QUEUE_STRATEGY = process.env.QUEUE_STRATEGY || 'postgres'

let redisQueue: Queue | null = null
if (QUEUE_STRATEGY === 'redis') {
  const connection = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  }
  redisQueue = new Queue('generation', { connection })
}

// Prefer pooled DATABASE_URL to avoid IPv6-only direct host on some networks.
// Falls back to DIRECT_URL when DATABASE_URL is not set.
const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL })

export async function enqueueGenerationJob(payload: { userId: string; brandProfileId: string; batchId: string }) {
  if (QUEUE_STRATEGY === 'redis' && redisQueue) {
    try {
      return await redisQueue.add('generate', payload, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } })
    } catch (err) {
      console.error('Redis queue add failed, falling back to Postgres queue', err)
      // fall-through to postgres
    }
  }

  // Insert a job row into the JobQueue table and notify listeners
  const job = await prisma.jobQueue.create({ data: { type: 'generate', payload } })

  // Send a NOTIFY so workers listening on the DB get the job immediately
  // Use the pg_notify function which is parameterizable and avoids SQL syntax issues
  const client = await pool.connect()
  try {
    await client.query('SELECT pg_notify($1, $2)', ['jobs', job.id])
  } catch (err) {
    console.error('Postgres notify failed for job', job.id, err)
  } finally {
    client.release()
  }

  return job
}

// Graceful shutdown for the pool when the process exits
if (process && typeof process.on === 'function') {
  process.on('SIGINT', async () => {
    try { await pool.end() } catch (e) {}
    process.exit(0)
  })
  process.on('SIGTERM', async () => {
    try { await pool.end() } catch (e) {}
    process.exit(0)
  })
}

