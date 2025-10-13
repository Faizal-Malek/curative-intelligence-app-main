import { prisma } from '@/lib/prisma'
import { clerkClient } from '@clerk/nextjs/server'

// Minimal shape for Clerk user responses. We intentionally keep this open to
// accommodate different Clerk SDK and API shapes across environments.
type ClerkUser = Record<string, unknown> | null

// Helper to fetch Clerk user via REST API as a fallback when `clerkClient.users` is not available
async function fetchClerkUserViaApi(clerkId: string): Promise<ClerkUser> {
  const key = process.env.CLERK_SECRET_KEY
  if (!key) throw new Error('CLERK_SECRET_KEY is required for fallback Clerk API calls')

  const res = await fetch(`https://api.clerk.com/v1/users/${clerkId}`, {
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Clerk API responded with ${res.status}`)
  return res.json()
}

// Finds the app User by Clerk userId using email as the stable key.
// Creates the user if it doesn't exist. Avoids touching `clerkId` column so
// it works even if that column hasn't been migrated yet.
export async function ensureUserByClerkId(clerkId: string): Promise<{ id: string; email?: string | null; onboardingComplete?: boolean } | null> {
  // Try to use the server SDK first. In some runtimes the SDK shape may differ,
  // so fallback to the Clerk REST API using the service key.
  let cu: ClerkUser = null
  try {
    // The clerk SDK exposes users.getUser in some versions; other shapes exist
    // in different runtimes. We defensively probe for the method and fall back.
    if ((clerkClient as any)?.users?.getUser) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      cu = await (clerkClient as any).users.getUser(clerkId)
    } else {
      // Fallback to REST API call
      cu = await fetchClerkUserViaApi(clerkId)
    }
  } catch (err) {
    console.warn('[ensureUserByClerkId] clerk lookup failed, falling back to REST API if possible', err)
    try { cu = await fetchClerkUserViaApi(clerkId) } catch (e) { /* ignore */ }
  }

  // Debug: log the Clerk user object so we can inspect field shapes when troubleshooting
  try { console.debug('[ensureUserByClerkId] clerk user object:', cu) } catch {}

  // Try several possible shapes returned by different Clerk SDK / API versions
  // Safely read possible email fields from multiple Clerk shapes
  const e = (
    // Common SDK shape
    (cu as any)?.primaryEmailAddress?.emailAddress ||
    // Alternate REST API shape
    (cu as any)?.primary_email_address?.email_address ||
    // Legacy or simplified shapes
    (cu as any)?.email ||
    (cu as any)?.email_addresses?.[0]?.email_address ||
    (cu as any)?.primary_email_addresses?.[0]?.email_address ||
    (cu as any)?.emails?.[0]?.address
  )
  const email = typeof e === 'string' ? e.toLowerCase() : undefined

  // If we have an email, prefer linking by email. Otherwise try clerkId.
  if (email) {
    const foundByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, onboardingComplete: true },
    })
    if (foundByEmail) return foundByEmail

    // Create or attach via email using upsert (avoids unique conflicts),
    // and only include minimal required fields.
    try {
      const upserted = await prisma.user.upsert({
        where: { email },
        update: {
          // if record exists, ensure it has this clerkId
          clerkId,
          // enrich profile fields if we have them
          ...(cu && (cu as any).firstName ? { firstName: (cu as any).firstName as string } : {}),
          ...(cu && (cu as any).lastName ? { lastName: (cu as any).lastName as string } : {}),
          ...(cu && ((cu as any).imageUrl || (cu as any).image_url) ? { imageUrl: (cu as any).imageUrl || (cu as any).image_url } : {}),
        },
        create: {
          clerkId,
          email,
          // optional fields only when present
          ...(cu && (cu as any).firstName ? { firstName: (cu as any).firstName as string } : {}),
          ...(cu && (cu as any).lastName ? { lastName: (cu as any).lastName as string } : {}),
          ...(cu && ((cu as any).imageUrl || (cu as any).image_url) ? { imageUrl: (cu as any).imageUrl || (cu as any).image_url } : {}),
        },
        select: { id: true, email: true, onboardingComplete: true },
      })
      return upserted as any
    } catch (e) {
      console.error('[ensureUserByClerkId] upsert failed', e)
      throw e
    }
  } else {
    // No email available: avoid creating a user that violates NOT NULL(email)
    const foundByClerkId = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, email: true, onboardingComplete: true },
    })
    if (foundByClerkId) return foundByClerkId
    // Indicate to callers that the user should sign in/verify to supply an email
    return null
  }
}

