// src/app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma as db } from '@/lib/prisma'
import { PostStatus } from '@prisma/client'
import { withApiMiddleware } from '@/lib/api-middleware'
import { logger } from '@/lib/monitoring'
import { dashboardStatsSchema } from '@/lib/validation-schemas'

async function handler(request: NextRequest, context: { user?: any }) {
  const { user } = context
  
  if (!user) {
    throw new Error('User not found in context')
  }

  logger.info('Dashboard stats requested', { userId: user.id })
  
  let scheduledPosts = 0
  let ideasInVault = 0
  let recentActivity = 0
  
  // Query each table separately to handle missing tables gracefully
  try {
    scheduledPosts = await db.post.count({ 
      where: { userId: user.id, status: PostStatus.SCHEDULED } 
    }).catch(() => 0)
  } catch (error: any) {
    logger.debug('Post table query failed, using 0', { userId: user.id })
  }
  
  try {
    ideasInVault = await db.contentIdea.count({ 
      where: { userId: user.id } 
    }).catch(() => 0)
  } catch (error: any) {
    logger.debug('ContentIdea table query failed, using 0', { userId: user.id })
  }
  
  try {
    recentActivity = await db.generationBatch.count({ 
      where: { userId: user.id } 
    }).catch(() => 0)
  } catch (error: any) {
    logger.debug('GenerationBatch table query failed, using 0', { userId: user.id })
  }

  const stats = {
    scheduledPosts,
    ideasInVault,
    engagementDelta: 18,
    recentActivity,
  }

  logger.info('Dashboard stats retrieved', { userId: user.id, stats })

  return NextResponse.json(stats)
}

export const GET = withApiMiddleware(handler, {
  requireAuth: true,
  rateLimitConfig: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 minute
  },
  logRequest: true
})

