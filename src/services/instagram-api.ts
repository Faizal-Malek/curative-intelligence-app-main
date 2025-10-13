// Instagram Basic Display API Service
// Handles fetching user profile and media data from Instagram

import { getUserSocialTokens, updateAccountLastSync, storeSocialAnalytics } from '@/lib/social-tokens';

export interface InstagramProfile {
  id: string;
  username: string;
  account_type: 'PERSONAL' | 'BUSINESS';
  media_count: number;
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramInsights {
  reach?: number;
  impressions?: number;
  profile_views?: number;
  website_clicks?: number;
}

export class InstagramAPI {
  private baseUrl = 'https://graph.instagram.com';

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken: string): Promise<InstagramProfile> {
    const response = await fetch(
      `${this.baseUrl}/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user's media (posts)
   */
  async getUserMedia(accessToken: string, limit: number = 25): Promise<{ data: InstagramMedia[] }> {
    const fields = 'id,media_type,media_url,permalink,caption,timestamp';
    const response = await fetch(
      `${this.baseUrl}/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get insights for a specific media item (requires Business account)
   */
  async getMediaInsights(mediaId: string, accessToken: string): Promise<any> {
    const metrics = 'impressions,reach,likes,comments,saves,shares';
    const response = await fetch(
      `${this.baseUrl}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`
    );

    if (!response.ok) {
      // Personal accounts don't have access to insights
      if (response.status === 400) {
        return null;
      }
      throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get account insights (requires Business account)
   */
  async getAccountInsights(accessToken: string, period: 'day' | 'week' | 'days_28' = 'day'): Promise<InstagramInsights | null> {
    const metrics = 'impressions,reach,profile_views,website_clicks';
    const response = await fetch(
      `${this.baseUrl}/me/insights?metric=${metrics}&period=${period}&access_token=${accessToken}`
    );

    if (!response.ok) {
      // Personal accounts don't have access to insights
      if (response.status === 400) {
        return null;
      }
      throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform the response into a more usable format
    const insights: InstagramInsights = {};
    data.data?.forEach((metric: any) => {
      insights[metric.name as keyof InstagramInsights] = metric.values?.[0]?.value || 0;
    });

    return insights;
  }

  /**
   * Refresh a long-lived access token
   */
  async refreshAccessToken(accessToken: string): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    const response = await fetch(
      `${this.baseUrl}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      throw new Error(`Instagram token refresh error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get analytics data for a specific user's connected Instagram account
   */
  async getAnalyticsForUser(userId: string): Promise<{
    followers: number;
    following: number;
    posts: number;
    engagement: number;
    reach?: number;
    impressions?: number;
  } | null> {
    try {
      // Get stored Instagram tokens for the user
      const tokenData = await getUserSocialTokens(userId, 'INSTAGRAM');
      
      if (!tokenData) {
        console.log(`No Instagram account connected for user ${userId}`);
        return null;
      }

      const analytics = await this.getAnalyticsData(tokenData.accessToken);
      
      // Update last sync time and store analytics
      await updateAccountLastSync(tokenData.id);
      await storeSocialAnalytics(tokenData.id, {
        ...analytics,
        reach: analytics.reach || 0,
        impressions: analytics.impressions || 0
      });
      
      return analytics;
    } catch (error) {
      console.error(`Error fetching Instagram analytics for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get analytics data formatted for our database (using provided access token)
   */
  async getAnalyticsData(accessToken: string): Promise<{
    followers: number;
    following: number;
    posts: number;
    engagement: number;
    reach?: number;
    impressions?: number;
  }> {
    try {
      const profile = await this.getUserProfile(accessToken);
      const media = await this.getUserMedia(accessToken, 25);
      const insights = await this.getAccountInsights(accessToken);

      // Calculate engagement rate from recent posts
      const recentPosts = media.data.slice(0, 10);
      let totalEngagement = 0;
      let postsWithStats = 0;

      for (const post of recentPosts) {
        try {
          const mediaInsights = await this.getMediaInsights(post.id, accessToken);
          if (mediaInsights?.data) {
            const likes = mediaInsights.data.find((m: any) => m.name === 'likes')?.values?.[0]?.value || 0;
            const comments = mediaInsights.data.find((m: any) => m.name === 'comments')?.values?.[0]?.value || 0;
            totalEngagement += likes + comments;
            postsWithStats++;
          }
        } catch (error) {
          // Skip posts without insights (personal accounts)
          console.warn('Could not get insights for post:', post.id);
        }
      }

      const avgEngagement = postsWithStats > 0 ? totalEngagement / postsWithStats : 0;
      const engagementRate = profile.media_count > 0 ? (avgEngagement / profile.media_count) * 100 : 0;

      return {
        followers: 0, // Instagram Basic Display API doesn't provide follower count
        following: 0, // Instagram Basic Display API doesn't provide following count
        posts: profile.media_count,
        engagement: Math.round(engagementRate * 100) / 100,
        reach: insights?.reach,
        impressions: insights?.impressions,
      };
    } catch (error) {
      console.error('Error fetching Instagram analytics:', error);
      throw error;
    }
  }
}