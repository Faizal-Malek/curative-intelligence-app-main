// src/lib/user-supabase.ts
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

// Finds/creates app user using Supabase auth user id/email.
// Reuses the existing schema by storing Supabase user id in `clerkId` column.
// Automatically populates profile with data from OAuth providers (Google, etc.)
export async function ensureUserBySupabase(
  userId: string, 
  email: string | null, 
  profile?: { 
    firstName?: string | null, 
    lastName?: string | null, 
    imageUrl?: string | null,
    phone?: string | null,
  }
) {
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
    // Only update if clerkId is missing OR we have new profile data to fill in
    const needsClerkId = !foundByEmail.clerkId
    const hasNewProfileData = 
      (!foundByEmail.firstName && profile?.firstName) ||
      (!foundByEmail.lastName && profile?.lastName) ||
      (!foundByEmail.imageUrl && profile?.imageUrl) ||
      (!foundByEmail.phone && profile?.phone)
    
    if (needsClerkId || hasNewProfileData) {
      try {
        const updateData: any = {}
        
        if (needsClerkId) {
          updateData.clerkId = userId
        }
        
        // Only update profile fields if they're currently empty and we have new data
        if (!foundByEmail.firstName && profile?.firstName) {
          updateData.firstName = profile.firstName
        }
        if (!foundByEmail.lastName && profile?.lastName) {
          updateData.lastName = profile.lastName
        }
        if (!foundByEmail.imageUrl && profile?.imageUrl) {
          updateData.imageUrl = profile.imageUrl
        }
        if (!foundByEmail.phone && profile?.phone) {
          updateData.phone = profile.phone
        }
        
        return await prisma.user.update({ 
          where: { email }, 
          data: updateData
        })
      } catch {
        return foundByEmail
      }
    }
    
    return foundByEmail
  }

  // Fallback: same Supabase uid already exists under a different email
  const foundById = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (foundById) {
    // Only update if email changed or we have new profile data
    const needsEmailUpdate = foundById.email !== email
    const hasNewProfileData = 
      (!foundById.firstName && profile?.firstName) ||
      (!foundById.lastName && profile?.lastName) ||
      (!foundById.imageUrl && profile?.imageUrl) ||
      (!foundById.phone && profile?.phone)
    
    if (needsEmailUpdate || hasNewProfileData) {
      try {
        const updateData: any = {}
        
        if (needsEmailUpdate) {
          updateData.email = email
        }
        
        // Update profile fields if they're empty and we have new data
        if (!foundById.firstName && profile?.firstName) {
          updateData.firstName = profile.firstName
        }
        if (!foundById.lastName && profile?.lastName) {
          updateData.lastName = profile.lastName
        }
        if (!foundById.imageUrl && profile?.imageUrl) {
          updateData.imageUrl = profile.imageUrl
        }
        if (!foundById.phone && profile?.phone) {
          updateData.phone = profile.phone
        }
        
        return await prisma.user.update({
          where: { clerkId: userId },
          data: updateData,
        })
      } catch {
        // If update fails, return existing to avoid blocking login
        return foundById
      }
    }
    
    return foundById
  }

  // Create new user with standard Prisma approach
  // This is where we populate ALL available profile data from OAuth
  try {
    const created = await prisma.user.create({
      data: {
        clerkId: userId,
        email,
        firstName: profile?.firstName ?? null,
        lastName: profile?.lastName ?? null,
        imageUrl: profile?.imageUrl ?? null,
        phone: profile?.phone ?? null,
        plan: 'free',
        role: 'USER',
        status: 'ACTIVE',
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

export function extractProfileFromSupabaseUser(supabaseUser?: SupabaseUser | null) {
  if (!supabaseUser) return undefined
  const metadata = supabaseUser.user_metadata || {}
  const identities = supabaseUser.identities?.[0]?.identity_data || {}

  // Try multiple sources: user_metadata and identity_data (Google OAuth)
  const rawFirst = metadata.firstName || metadata.first_name || metadata.given_name || 
                   identities.given_name || identities.first_name
  const rawLast = metadata.lastName || metadata.last_name || metadata.family_name || 
                  identities.family_name || identities.last_name
  const fullName = metadata.full_name || metadata.fullName || metadata.name || 
                   identities.full_name || identities.name

  let firstName = rawFirst as string | undefined | null
  let lastName = rawLast as string | undefined | null

  if ((!firstName || !lastName) && typeof fullName === 'string') {
    const parts = fullName.trim().split(/\s+/)
    if (parts.length) {
      firstName = firstName || parts[0]
      lastName = lastName || parts.slice(1).join(' ').trim() || null
    }
  }

  const phone = (metadata.phone || metadata.phone_number || supabaseUser.phone || null) as string | null
  // Google OAuth stores picture in identity_data.avatar_url or identity_data.picture
  const imageUrl = (metadata.avatar_url || metadata.picture || metadata.imageUrl || 
                    identities.avatar_url || identities.picture || 
                    supabaseUser.user_metadata?.avatarUrl || null) as string | null

  return {
    firstName: firstName ?? null,
    lastName: (lastName && lastName.length ? lastName : null) ?? null,
    imageUrl,
    phone,
  }
}
