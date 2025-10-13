#!/usr/bin/env node
/**
 * Node migration script (compiled JS) - safe runner without ts-node dependency.
 * Requires MONGO_URI and DATABASE_URL in env.
 */
const { MongoClient } = require('mongodb')
const { PrismaClient } = require('@prisma/client')

const MONGO_URI = process.env.MONGO_URI
if (!MONGO_URI) {
  console.error('MONGO_URI is required')
  process.exit(1)
}

const prisma = new PrismaClient()

async function run() {
  const client = new MongoClient(MONGO_URI)
  await client.connect()
  const db = client.db()

  const idMap = { users: new Map(), posts: new Map(), batches: new Map(), profiles: new Map() }

  const users = await db.collection('User').find().toArray()
  console.log('Found users:', users.length)
  for (const u of users) {
    const created = await prisma.user.create({
      data: {
        clerkId: u.clerkId,
        email: u.email,
        firstName: u.firstName ?? null,
        lastName: u.lastName ?? null,
        imageUrl: u.imageUrl ?? null,
        plan: u.plan ?? 'free',
        onboardingComplete: !!u.onboardingComplete,
        hasGeneratedFirstBatch: !!u.hasGeneratedFirstBatch,
        createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
        updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined,
      },
    })
    idMap.users.set(String(u._id), created.id)
  }

  const profiles = await db.collection('BrandProfile').find().toArray()
  console.log('Found profiles:', profiles.length)
  for (const p of profiles) {
    const userId = idMap.users.get(String(p.userId))
    if (!userId) {
      console.warn('Skipping profile for missing user', p.userId)
      continue
    }
    const created = await prisma.brandProfile.create({
      data: {
        userId,
        brandName: p.brandName,
        industry: p.industry,
        brandDescription: p.brandDescription,
        brandVoiceDescription: p.brandVoiceDescription,
        primaryGoal: p.primaryGoal,
        doRules: p.doRules ?? null,
        dontRules: p.dontRules ?? null,
        createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
      },
    })
    idMap.profiles.set(String(p._id), created.id)
  }

  const batches = await db.collection('GenerationBatch').find().toArray()
  console.log('Found batches:', batches.length)
  for (const b of batches) {
    const userId = idMap.users.get(String(b.userId))
    if (!userId) {
      console.warn('Skipping batch for missing user', b.userId)
      continue
    }
    const created = await prisma.generationBatch.create({
      data: {
        userId,
        status: b.status ?? 'PENDING',
        createdAt: b.createdAt ? new Date(b.createdAt) : undefined,
        updatedAt: b.updatedAt ? new Date(b.updatedAt) : undefined,
      },
    })
    idMap.batches.set(String(b._id), created.id)
  }

  const posts = await db.collection('Post').find().toArray()
  console.log('Found posts:', posts.length)
  for (const p of posts) {
    const userId = idMap.users.get(String(p.userId))
    if (!userId) {
      console.warn('Skipping post for missing user', p.userId)
      continue
    }
    const batchId = p.batchId ? idMap.batches.get(String(p.batchId)) : undefined
    await prisma.post.create({
      data: {
        userId,
        batchId,
        content: p.content ?? '',
        status: p.status ?? 'AWAITING_REVIEW',
        mediaUrl: p.mediaUrl ?? null,
        likes: p.likes ?? 0,
        comments: p.comments ?? 0,
        reach: p.reach ?? 0,
        scheduledAt: p.scheduledAt ? new Date(p.scheduledAt) : null,
        postedAt: p.postedAt ? new Date(p.postedAt) : null,
        createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
        updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
      },
    })
  }

  console.log('Migration done')
  await prisma.$disconnect()
  await client.close()
}

run().catch(async (err) => {
  console.error(err)
  try { await prisma.$disconnect() } catch (e) {}
  process.exit(1)
})
