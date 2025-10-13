// Facebook Graph API Service
// Handles fetching page data and insights from Facebook

import { getUserSocialTokens, updateAccountLastSync, storeSocialAnalytics } from '@/lib/social-tokens';

export interface FacebookPage {
  id: string;
  name: string;
  username?: string;
  category: string;
  fan_count: number;
  picture: {
    data: {
      url: string;
    };
  };
}

export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  type: string;
  permalink_url: string;
  likes?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    summary: {
      total_count: number;
    };
  };
  shares?: {
    count: number;
  };
}

export interface FacebookInsights {
  page_impressions: number;
  page_reach: number;
  page_engaged_users: number;
  page_post_engagements: number;
  page_fans: number;
}

export class FacebookAPI {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  /**
   * Get user's Facebook pages
   */
  async getUserPages(accessToken: string): Promise<{ data: FacebookPage[] }> {
    const fields = 'id,name,username,category,fan_count,picture';
    const response = await fetch(
      `${this.baseUrl}/me/accounts?fields=${fields}&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get page details
   */
  async getPageDetails(pageId: string, accessToken: string): Promise<FacebookPage> {
    const fields = 'id,name,username,category,fan_count,picture';
    const response = await fetch(
      `${this.baseUrl}/${pageId}?fields=${fields}&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get page posts
   */
  async getPagePosts(pageId: string, accessToken: string, limit: number = 25): Promise<{ data: FacebookPost[] }> {
    const fields = 'id,message,story,created_time,type,permalink_url,likes.summary(true),comments.summary(true),shares';
    const response = await fetch(
      `${this.baseUrl}/${pageId}/posts?fields=${fields}&limit=${limit}&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get page insights
   */
  async getPageInsights(
    pageId: string, 
    accessToken: string, 
    metrics: string[] = ['page_impressions', 'page_reach', 'page_engaged_users', 'page_post_engagements', 'page_fans'],
    period: 'day' | 'week' | 'days_28' = 'day'
  ): Promise<any> {
    const metricsString = metrics.join(',');
    const response = await fetch(
      `${this.baseUrl}/${pageId}/insights?metric=${metricsString}&period=${period}&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get post insights
   */
  async getPostInsights(postId: string, accessToken: string): Promise<any> {
    const metrics = 'post_impressions,post_reach,post_engaged_users,post_clicks,post_reactions_by_type_total';
    const response = await fetch(
      `${this.baseUrl}/${postId}/insights?metric=${metrics}&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get long-lived page access token
   */
  async getLongLivedPageToken(pageId: string, userAccessToken: string): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/${pageId}?fields=access_token&access_token=${userAccessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  /**
   * Extend user access token
   */
  async extendAccessToken(accessToken: string, clientId: string, clientSecret: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }> {
    const response = await fetch(
      `${this.baseUrl}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Facebook token extension error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get analytics data formatted for our database
   */
  async getAnalyticsData(pageId: string, accessToken: string): Promise<{
    followers: number;
    following: number;
    posts: number;
    engagement: number;
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
  }> {
    try {
      // Get page details
      const pageDetails = await this.getPageDetails(pageId, accessToken);
      
      // Get recent posts
      const posts = await this.getPagePosts(pageId, accessToken, 25);
      
      // Get page insights
      const insights = await this.getPageInsights(pageId, accessToken);
      
      // Calculate engagement metrics from recent posts
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;
      let totalEngagement = 0;

      for (const post of posts.data) {
        const likes = post.likes?.summary?.total_count || 0;
        const comments = post.comments?.summary?.total_count || 0;
        const shares = post.shares?.count || 0;
        
        totalLikes += likes;
        totalComments += comments;
        totalShares += shares;
        totalEngagement += likes + comments + shares;
      }

      // Process insights data
      const insightsData: any = {};
      insights.data?.forEach((metric: any) => {
        const latestValue = metric.values?.[metric.values.length - 1]?.value || 0;
        insightsData[metric.name] = latestValue;
      });

      // Calculate engagement rate
      const avgEngagementPerPost = posts.data.length > 0 ? totalEngagement / posts.data.length : 0;
      const engagementRate = pageDetails.fan_count > 0 ? (avgEngagementPerPost / pageDetails.fan_count) * 100 : 0;

      return {
        followers: pageDetails.fan_count,
        following: 0, // Facebook doesn't provide following count for pages
        posts: posts.data.length,
        engagement: Math.round(engagementRate * 100) / 100,
        reach: insightsData.page_reach || 0,
        impressions: insightsData.page_impressions || 0,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
      };
    } catch (error) {
      console.error('Error fetching Facebook analytics:', error);
      throw error;
    }
  }

  /**
   * Get analytics data for a specific user's connected Facebook pages
   */
  async getAnalyticsForUser(userId: string): Promise<Array<{
    pageId: string;
    pageName: string;
    analytics: {
      followers: number;
      following: number;
      posts: number;
      engagement: number;
      reach: number;
      impressions: number;
    } | null;
  }> | null> {
    try {
      // Get stored Facebook tokens for the user
      const tokenData = await getUserSocialTokens(userId, 'FACEBOOK');
      
      if (!tokenData) {
        console.log(`No Facebook account connected for user ${userId}`);
        return null;
      }

      const pagesAnalytics = await this.getAllPagesAnalytics(tokenData.accessToken);
      
      // Update last sync time and store analytics for each page
      await updateAccountLastSync(tokenData.id);
      
      for (const pageData of pagesAnalytics) {
        if (pageData.analytics) {
          await storeSocialAnalytics(tokenData.id, pageData.analytics);
        }
      }
      
      return pagesAnalytics;
    } catch (error) {
      console.error(`Error fetching Facebook analytics for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get all pages analytics for a user (using provided access token)
   */
  async getAllPagesAnalytics(accessToken: string): Promise<Array<{
    pageId: string;
    pageName: string;
    analytics: any;
  }>> {
    try {
      const pages = await this.getUserPages(accessToken);
      const analyticsPromises = pages.data.map(async (page) => {
        try {
          // Get long-lived page token for insights
          const pageToken = await this.getLongLivedPageToken(page.id, accessToken);
          const analytics = await this.getAnalyticsData(page.id, pageToken);
          
          return {
            pageId: page.id,
            pageName: page.name,
            analytics,
          };
        } catch (error) {
          console.error(`Error fetching analytics for page ${page.id}:`, error);
          return {
            pageId: page.id,
            pageName: page.name,
            analytics: null,
          };
        }
      });

      return Promise.all(analyticsPromises);
    } catch (error) {
      console.error('Error fetching all pages analytics:', error);
      throw error;
    }
  }
}