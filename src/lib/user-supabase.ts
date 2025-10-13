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
  } catch (e) {
    // Surface meaningful error to caller; they log and return 500
    throw e
  }
}
