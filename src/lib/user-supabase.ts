// src/lib/user-supabase.ts
import { prisma } from '@/lib/prisma'

// Finds/creates app user using Supabase auth user id/email.
// Reuses the existing schema by storing Supabase user id in `clerkId` column.
export async function ensureUserBySupabase(userId: string, email: string | null, profile?: { firstName?: string | null, lastName?: string | null, imageUrl?: string | null }) {
  if (!email) {
    // No email: try by pseudo clerkId (supabase uid)
    const byId = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (byId) return byId
    // cannot create without email (model has email unique/required). Callers should prompt login/verify.
    return null
  }

  // Prefer linking by email
  const foundByEmail = await prisma.user.findUnique({ where: { email } })
  if (foundByEmail) {
    // Attach supabase id if missing
    if (!foundByEmail.clerkId) {
      try { await prisma.user.update({ where: { email }, data: { clerkId: userId } }) } catch {}
    }
    return foundByEmail
  }

  // Fallback: same Supabase uid already exists under a different email
  const foundById = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (foundById) {
    // Keep the record and optionally sync email if it changed
    if (foundById.email !== email) {
      try {
        return await prisma.user.update({
          where: { clerkId: userId },
          data: { email },
        })
      } catch {
        // If update fails, return existing to avoid blocking login
        return foundById
      }
    }
    return foundById
  }

  // Create new user with standard Prisma approach
  try {
    const created = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        firstName: profile?.firstName ?? null,
        lastName: profile?.lastName ?? null,
        imageUrl: profile?.imageUrl ?? null,
        plan: 'free',
        onboardingComplete: false,
      },
    })
    return created
  } catch (e: any) {
    // Gracefully handle duplicate clerkId (P2002) by returning the existing record
    const isUniqueClerkId = e?.code === 'P2002' && Array.isArray(e?.meta?.target) && e.meta.target.includes('clerkId')
    if (isUniqueClerkId) {
      const existing = await prisma.user.findUnique({ where: { clerkId: userId } })
      if (existing) return existing
    }
    // Surface meaningful error to caller; they log and return 500
    throw e
  }
}
