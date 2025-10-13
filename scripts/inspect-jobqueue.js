#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client')

async function main() {
  const prisma = new PrismaClient()
  try {
    const rows = await prisma.jobQueue.findMany({ orderBy: { createdAt: 'desc' }, take: 10 })
    console.log('Latest JobQueue rows:', rows.length)
    for (const r of rows) {
      console.log(JSON.stringify({ id: r.id, type: r.type, status: r.status, attempts: r.attempts, createdAt: r.createdAt, updatedAt: r.updatedAt, payload: r.payload }, null, 2))
    }
  } catch (err) {
    console.error('Inspect error', err)
    process.exit(2)
  } finally {
    await prisma.$disconnect()
  }
}

main()
