// File Path: src/app/api/onboarding/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma as db } from "@/lib/prisma";
import { withApiMiddleware } from '@/lib/api-middleware';
import { logger } from '@/lib/monitoring';
import { createError } from '@/lib/error-handler';
import { onboardingSchema } from "@/lib/validations/onboarding";

function normalizeGuidelineRules(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0)
      .join('\n')
      .trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  return undefined;
}

async function handler(request: NextRequest, context: { user?: any, body?: any }) {
  const { user, body } = context;
  
  if (!user) {
    throw createError.unauthorized('User not found in context');
  }

  logger.info('Onboarding profile update requested', { userId: user.id });

  // Handle empty body validation
  if (!body) {
    throw createError.validation('Request body is required');
  }

  // Persist userType if sent (from step 1); ignore invalid value silently
  if (body.userType === 'business' || body.userType === 'influencer') {
    try {
      await db.user.update({ 
        where: { id: user.id }, 
        data: { userType: body.userType } 
      });
    } catch (error) {
      logger.warn('Failed to update user type', { userId: user.id, error });
    }
  }

  // Persist based on userType. If influencer, store to InfluencerProfile; else BrandProfile
  if (body.userType === 'influencer') {
    const doRules = normalizeGuidelineRules(body.doRules);
    const dontRules = normalizeGuidelineRules(body.dontRules);

    const inf = {
      displayName: String(body.displayName || ''),
      niche: String(body.niche || ''),
      bio: String(body.bio || ''),
      contentStyle: String(body.contentStyle || ''),
      doRules: doRules ?? null,
      dontRules: dontRules ?? null,
    };

    if (!inf.displayName || !inf.niche || !inf.bio || !inf.contentStyle) {
      throw createError.validation('Missing required influencer profile fields');
    }

    await db.influencerProfile.upsert({
      where: { userId: user.id },
      update: { ...inf },
      create: { ...inf, userId: user.id },
    });
  } else {
    const normalizedBody = {
      ...body,
      doRules: normalizeGuidelineRules(body.doRules),
      dontRules: normalizeGuidelineRules(body.dontRules),
    };

    const result = onboardingSchema.safeParse(normalizedBody);
    if (!result.success) {
      throw createError.validation('Invalid brand profile data', {
        details: result.error.flatten()
      });
    }

    const validatedData = result.data;
    await db.brandProfile.upsert({
      where: { userId: user.id },
      update: {
        brandName: validatedData.brandName,
        industry: validatedData.industry,
        brandDescription: validatedData.brandDescription,
        brandVoiceDescription: validatedData.brandVoiceDescription,
        primaryGoal: validatedData.primaryGoal,
        doRules: validatedData.doRules ?? null,
        dontRules: validatedData.dontRules ?? null,
      },
      create: {
        brandName: validatedData.brandName,
        industry: validatedData.industry,
        brandDescription: validatedData.brandDescription,
        brandVoiceDescription: validatedData.brandVoiceDescription,
        primaryGoal: validatedData.primaryGoal,
        doRules: validatedData.doRules ?? null,
        dontRules: validatedData.dontRules ?? null,
        userId: user.id,
      },
    });
  }

  // Mark onboarding as complete for the user
  await db.user.update({
    where: { id: user.id },
    data: { onboardingComplete: true },
  });

  logger.info('Onboarding profile completed', { 
    userId: user.id, 
    userType: body.userType 
  });

  return NextResponse.json({ success: true }, { status: 201 });
}

export const POST = withApiMiddleware(handler, {
  requireAuth: true,
  validateBody: z.object({
    userType: z.enum(['business', 'influencer']).optional(),
    // Allow either influencer or brand fields
    displayName: z.string().optional(),
    niche: z.string().optional(),
    bio: z.string().optional(),
    contentStyle: z.string().optional(),
    targetAudience: z.string().optional(),
    primaryPlatforms: z.string().optional(),
    followerCount: z.string().optional(),
    postingFrequency: z.string().optional(),
    brandName: z.string().optional(),
    industry: z.string().optional(),
    brandDescription: z.string().optional(),
    targetDemographics: z.string().optional(),
    customerPainPoints: z.string().optional(),
    preferredChannels: z.string().optional(),
    brandVoiceDescription: z.string().optional(),
    primaryGoal: z.string().optional(),
    doRules: z.union([z.string(), z.array(z.string())]).optional(),
    dontRules: z.union([z.string(), z.array(z.string())]).optional(),
  }),
  rateLimitConfig: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  logRequest: true
});
