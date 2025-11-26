// File Path: src/app/api/content/generate-batch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma as db } from '@/lib/prisma';
import { enqueueGenerationJob } from '@/lib/queue';
import { withApiMiddleware } from '@/lib/api-middleware';
import { logger } from '@/lib/monitoring';
import { createError } from '@/lib/error-handler';
import { generateVaultAssetsForUser } from '@/services/content-vault';

async function handler(request: NextRequest, context: { user?: any }) {
  const { user } = context;
  
  if (!user) {
    throw createError.unauthorized('User not found in context');
  }

  logger.info('Content generation batch requested', { userId: user.id });

  // Find user with brand profile
  const userRecord = await db.user.findUnique({ 
    where: { id: user.id }, 
    select: { 
      id: true, 
      brandProfile: { 
        select: { id: true } 
      } 
    } 
  });

  // Add a more specific check to ensure brandProfile and its ID exist.
  if (!userRecord || !userRecord.brandProfile?.id) {
    throw createError.notFound('User or brand profile not found. Please complete onboarding.');
  }

  // Create the batch record FIRST to get an ID for tracking.
  const batch = await db.generationBatch.create({
    data: {
      userId: userRecord.id,
      status: "PENDING",
    },
  });

  // Mark batch as PROCESSING and enqueue background job to a durable queue.
  await db.generationBatch.update({ 
    where: { id: batch.id }, 
    data: { status: 'PROCESSING' } 
  });
  
  await enqueueGenerationJob({ 
    userId: userRecord.id, 
    brandProfileId: userRecord.brandProfile.id, 
    batchId: batch.id 
  });

  logger.info('Content generation batch created', { 
    userId: userRecord.id, 
    batchId: batch.id 
  });

  try {
    await generateVaultAssetsForUser(userRecord.id, { batchId: batch.id })
  } catch (vaultError) {
    logger.warn('Failed to generate vault assets for batch', {
      userId: userRecord.id,
      batchId: batch.id,
      error: (vaultError as Error).message,
    })
  }

  // Immediately return the batchId to the frontend.
  return NextResponse.json({ success: true, batchId: batch.id });
}

export const POST = withApiMiddleware(handler, {
  requireAuth: true,
  rateLimitConfig: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute - stricter for generation
  },
  logRequest: true
});
