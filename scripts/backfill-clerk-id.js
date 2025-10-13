// Backfill `User.clerkId` by matching Clerk users to local users by email.
// Usage: DIRECT_URL=... CLERK_SECRET_KEY=... node scripts/backfill-clerk-id.js

const { PrismaClient } = require('@prisma/client')

async function fetchClerkUsers() {
  const users = []
  let url = 'https://api.clerk.com/v1/users?limit=100'
  const headers = { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` }
  while (url) {
    const res = await fetch(url, { headers })
    if (!res.ok) throw new Error(`Clerk API error ${res.status}`)
    const data = await res.json()
    // API returns array for v1/users without pagination meta in some modes.
    // Try to support both array and {data,next_url}
    const items = Array.isArray(data) ? data : data.data
    users.push(...items)
    url = Array.isArray(data) ? '' : data?.next_url || ''
  }
  return users
}

;(async () => {
  if (!process.env.DIRECT_URL && !process.env.DATABASE_URL) {
    throw new Error('DIRECT_URL or DATABASE_URL must be set for Prisma connection.')
  }
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is required to call Clerk API.')
  }

  const prisma = new PrismaClient()
  try {
    console.log('Fetching Clerk users...')
    const clerkUsers = await fetchClerkUsers()

    const map = new Map()
    for (const u of clerkUsers) {
      // derive primary email
      const primaryId = u.primary_email_address_id
      const entry = u.email_addresses?.find((e) => e.id === primaryId) || u.email_addresses?.[0]
      const email = entry?.email_address?.toLowerCase()
      if (email) map.set(email, u.id)
    }

    const local = await prisma.user.findMany({
      where: { OR: [{ clerkId: null }, { clerkId: '' }] },
      select: { id: true, email: true },
    })

    let updated = 0
    for (const u of local) {
      const email = u.email?.toLowerCase()
      const clerkId = email ? map.get(email) : null
      if (clerkId) {
        await prisma.user.update({ where: { id: u.id }, data: { clerkId } })
        updated++
      }
    }
    console.log(`Backfill complete. Updated ${updated} users.`)
  } finally {
    await prisma.$disconnect()
  }
})().catch((err) => {
  console.error(err)
  process.exit(1)
})

