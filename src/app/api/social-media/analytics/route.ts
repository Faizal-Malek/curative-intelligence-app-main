import { withGet, withPost } from '@/lib/api-middleware';
import { SocialMediaService } from '@/services/social-media-service';
import { schemas } from '@/lib/validation-schemas';
import { createError } from '@/lib/error-handler';
import { NextResponse } from 'next/server';

const socialMediaService = new SocialMediaService();

// GET /api/social-media/analytics - Get analytics for all connected accounts
export const GET = withGet(async (request, context) => {
  const { user, searchParams } = context;
  
  if (!user) {
    throw createError.unauthorized('Authentication required');
  }

  // Validate query parameters
  const queryValidation = schemas.analytics.query.safeParse({
    platform: searchParams?.get('platform'),
    dateRange: searchParams?.get('start') && searchParams?.get('end') ? {
      start: searchParams.get('start'),
      end: searchParams.get('end'),
    } : undefined,
  });

  if (!queryValidation.success) {
    throw createError.validation('Invalid query parameters', {
      errors: queryValidation.error.issues,
    });
  }

  try {
    // Fetch real analytics for the user
    const userAnalytics = await socialMediaService.getUserAnalytics(user.id);
    
    // Calculate aggregated metrics
    const platforms = [userAnalytics.instagram, userAnalytics.facebook, userAnalytics.twitter, userAnalytics.linkedin];
    const validPlatforms = platforms.filter(p => p !== null);
    
    const aggregated = validPlatforms.reduce(
      (acc, platform) => {
        if (Array.isArray(platform)) {
          // Facebook returns array of pages
          platform.forEach(page => {
            if (page.analytics) {
              acc.totalFollowers += page.analytics.followers || 0;
              acc.totalFollowing += page.analytics.following || 0;
              acc.totalPosts += page.analytics.posts || 0;
              acc.totalReach += page.analytics.reach || 0;
              acc.totalImpressions += page.analytics.impressions || 0;
              acc.engagementSum += page.analytics.engagement || 0;
              acc.engagementCount += 1;
            }
          });
        } else if (platform) {
          // Single platform analytics
          acc.totalFollowers += platform.followers || 0;
          acc.totalFollowing += platform.following || 0;
          acc.totalPosts += platform.posts || 0;
          acc.totalReach += platform.reach || 0;
          acc.totalImpressions += platform.impressions || 0;
          acc.engagementSum += platform.engagement || 0;
          acc.engagementCount += 1;
        }
        return acc;
      },
      {
        totalFollowers: 0,
        totalFollowing: 0,
        totalPosts: 0,
        totalReach: 0,
        totalImpressions: 0,
        engagementSum: 0,
        engagementCount: 0
      }
    );

    const avgEngagement = aggregated.engagementCount > 0
      ? aggregated.engagementSum / aggregated.engagementCount
      : 0;

    const analytics = {
      aggregated: {
        totalFollowers: aggregated.totalFollowers,
        totalFollowing: aggregated.totalFollowing,
        totalPosts: aggregated.totalPosts,
        avgEngagement: Math.round(avgEngagement * 100) / 100,
        totalReach: aggregated.totalReach,
        totalImpressions: aggregated.totalImpressions
      },
      byPlatform: {
        INSTAGRAM: userAnalytics.instagram,
        FACEBOOK: userAnalytics.facebook,
        TWITTER: userAnalytics.twitter,
        LINKEDIN: userAnalytics.linkedin
      },
      connectedAccounts: userAnalytics.connectedAccounts,
      lastUpdated: new Date().toISOString(),
      status: userAnalytics.connectedAccounts.length > 0 ? 'live_data' : 'no_accounts_connected'
    };

    return NextResponse.json({
      success: true,
      data: analytics,
      message: userAnalytics.connectedAccounts.length > 0 
        ? 'Live analytics from connected accounts' 
        : 'No social media accounts connected',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    throw createError.externalApi('Social Media API', 
      'Failed to fetch analytics data', 
      { userId: user.id }
    );
  }
}, {
  requireAuth: true,
  rateLimitConfig: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  logRequest: true,
});

// POST /api/social-media/analytics/refresh - Refresh analytics for all accounts
export const POST = withPost(async (request, context) => {
  const { user } = context;

  if (!user) {
    throw createError.unauthorized('Authentication required');
  }

  try {
    // Refresh analytics for all connected accounts
    const userAnalytics = await socialMediaService.getUserAnalytics(user.id);
    
    // Count successful refreshes
    let refreshed = 0;
    let failed = 0;
    
    if (userAnalytics.instagram) refreshed++;
    else if (userAnalytics.connectedAccounts.some(acc => acc.platform === 'INSTAGRAM')) failed++;
    
    if (userAnalytics.facebook) refreshed++;
    else if (userAnalytics.connectedAccounts.some(acc => acc.platform === 'FACEBOOK')) failed++;
    
    if (userAnalytics.twitter) refreshed++;
    else if (userAnalytics.connectedAccounts.some(acc => acc.platform === 'TWITTER')) failed++;
    
    if (userAnalytics.linkedin) refreshed++;
    else if (userAnalytics.connectedAccounts.some(acc => acc.platform === 'LINKEDIN')) failed++;

    return NextResponse.json({
      success: true,
      message: 'Analytics refreshed from connected accounts',
      data: {
        refreshed,
        failed,
        connectedAccounts: userAnalytics.connectedAccounts.length,
        lastRefresh: new Date().toISOString(),
      }
    });

  } catch (error) {
    throw createError.externalApi('Social Media API', 
      'Failed to refresh analytics data', 
      { userId: user.id }
    );
  }
}, {
  requireAuth: true,
  rateLimitConfig: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute - stricter for refresh
  },
});