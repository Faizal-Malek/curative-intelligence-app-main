// LinkedIn Marketing API Service
// Handles fetching profile and organization data from LinkedIn

import { getUserSocialTokens, updateAccountLastSync, storeSocialAnalytics } from '@/lib/social-tokens';

export interface LinkedInProfile {
  id: string;
  firstName: {
    localized: Record<string, string>;
  };
  lastName: {
    localized: Record<string, string>;
  };
  profilePicture?: {
    displayImage: {
      '~': {
        elements: Array<{
          identifiers: Array<{
            identifier: string;
          }>;
        }>;
      };
    };
  };
  headline?: {
    localized: Record<string, string>;
  };
}

export interface LinkedInOrganization {
  id: number;
  name: {
    localized: Record<string, string>;
  };
  description?: {
    localized: Record<string, string>;
  };
  logoV2?: {
    original: string;
  };
  website?: {
    localized: Record<string, string>;
  };
  followerCount?: number;
}

export interface LinkedInPost {
  id: string;
  activity: string;
  created: {
    time: number;
  };
  lastModified: {
    time: number;
  };
  author: string;
  lifecycleState: string;
  specificContent: any;
  visibility: {
    'com.linkedin.ugc.MemberNetworkVisibility': string;
  };
}

export interface LinkedInAnalytics {
  impressions: number;
  clicks: number;
  reactions: number;
  comments: number;
  shares: number;
  followers: number;
}

export class LinkedInAPI {
  private baseUrl = 'https://api.linkedin.com/v2';

  /**
   * Get authenticated user profile
   */
  async getProfile(accessToken: string): Promise<LinkedInProfile> {
    const response = await fetch(
      `${this.baseUrl}/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams),headline)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user's organizations (company pages they manage)
   */
  async getOrganizations(accessToken: string): Promise<{ elements: LinkedInOrganization[] }> {
    const response = await fetch(
      `${this.baseUrl}/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organizationalTarget~(id,name,description,logoV2,website,followerCount)))`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get organization details
   */
  async getOrganizationDetails(organizationId: string, accessToken: string): Promise<LinkedInOrganization> {
    const response = await fetch(
      `${this.baseUrl}/organizations/${organizationId}?projection=(id,name,description,logoV2,website,followerCount)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user generated content (posts)
   */
  async getUserPosts(personId: string, accessToken: string, count: number = 25): Promise<{ elements: LinkedInPost[] }> {
    const response = await fetch(
      `${this.baseUrl}/ugcPosts?q=authors&authors=List((person:${personId}))&sortBy=LAST_MODIFIED&count=${count}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get organization posts
   */
  async getOrganizationPosts(organizationId: string, accessToken: string, count: number = 25): Promise<{ elements: LinkedInPost[] }> {
    const response = await fetch(
      `${this.baseUrl}/ugcPosts?q=authors&authors=List((organization:${organizationId}))&sortBy=LAST_MODIFIED&count=${count}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get social actions (likes, comments, shares) for a post
   */
  async getPostSocialActions(postId: string, accessToken: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/socialActions/${postId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // This endpoint might not be available for all apps
      return { likes: 0, comments: 0, shares: 0 };
    }

    return response.json();
  }

  /**
   * Get organization follower statistics
   */
  async getOrganizationFollowerStats(organizationId: string, accessToken: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${organizationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get organization page statistics
   */
  async getOrganizationPageStats(organizationId: string, accessToken: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/organizationPageStatistics?q=organization&organization=urn:li:organization:${organizationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`LinkedIn API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get analytics data for a specific user's connected LinkedIn account
   */
  async getAnalyticsForUser(userId: string): Promise<{
    followers: number;
    following: number;
    posts: number;
    engagement: number;
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
  } | null> {
    try {
      // Get stored LinkedIn tokens for the user
      const tokenData = await getUserSocialTokens(userId, 'LINKEDIN');
      
      if (!tokenData) {
        console.log(`No LinkedIn account connected for user ${userId}`);
        return null;
      }

      const analytics = await this.getAnalyticsData(tokenData.accessToken);
      
      // Update last sync time and store analytics
      await updateAccountLastSync(tokenData.id);
      await storeSocialAnalytics(tokenData.id, {
        followers: analytics.followers,
        following: analytics.following,
        posts: analytics.posts,
        engagement: analytics.engagement,
        reach: analytics.reach,
        impressions: analytics.impressions
      });
      
      return analytics;
    } catch (error) {
      console.error(`Error fetching LinkedIn analytics for user ${userId}:`, error);
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
    reach: number;
    impressions: number;
    likes: number;
    comments: number;
    shares: number;
  }> {
    try {
      // Get user profile
      const profile = await this.getProfile(accessToken);
      const personId = profile.id;

      // Get user posts
      const posts = await this.getUserPosts(personId, accessToken, 25);

      // Get organizations managed by user
      let organizationData = null;
      try {
        const orgs = await this.getOrganizations(accessToken);
        if (orgs.elements && orgs.elements.length > 0) {
          const firstOrg = orgs.elements[0];
          organizationData = await this.getOrganizationDetails(firstOrg.id.toString(), accessToken);
        }
      } catch (error) {
        console.warn('Could not fetch organization data:', error);
      }

      // Calculate engagement metrics from posts
      let totalEngagement = 0;
      let totalLikes = 0;
      let totalComments = 0;
      let totalShares = 0;

      // Note: LinkedIn API has limited access to engagement metrics
      // Many metrics require special permissions or are not available in basic API
      for (const post of posts.elements || []) {
        try {
          const socialActions = await this.getPostSocialActions(post.id, accessToken);
          totalLikes += socialActions.likes || 0;
          totalComments += socialActions.comments || 0;
          totalShares += socialActions.shares || 0;
          totalEngagement += (socialActions.likes || 0) + (socialActions.comments || 0) + (socialActions.shares || 0);
        } catch (error) {
          // Social actions might not be available
          console.warn('Could not get social actions for post:', post.id);
        }
      }

      // Calculate engagement rate (basic estimation)
      const postsCount = posts.elements?.length || 0;
      const avgEngagementPerPost = postsCount > 0 ? totalEngagement / postsCount : 0;
      
      // Use organization followers if available, otherwise estimate
      const followers = organizationData?.followerCount || 500; // Default estimate
      const engagementRate = followers > 0 ? (avgEngagementPerPost / followers) * 100 : 0;

      return {
        followers: followers,
        following: 0, // LinkedIn doesn't provide following count in basic API
        posts: postsCount,
        engagement: Math.round(engagementRate * 100) / 100,
        reach: Math.round(totalEngagement * 5), // Estimated reach
        impressions: Math.round(totalEngagement * 10), // Estimated impressions
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
      };
    } catch (error) {
      console.error('Error fetching LinkedIn analytics:', error);
      throw error;
    }
  }

  /**
   * Get organization analytics (if user manages an organization)
   */
  async getOrganizationAnalytics(organizationId: string, accessToken: string): Promise<{
    followers: number;
    posts: number;
    engagement: number;
    pageViews: number;
  }> {
    try {
      // Get organization details
      const orgDetails = await this.getOrganizationDetails(organizationId, accessToken);
      
      // Get organization posts
      const posts = await this.getOrganizationPosts(organizationId, accessToken, 25);
      
      // Get follower statistics
      let followerStats = null;
      try {
        followerStats = await this.getOrganizationFollowerStats(organizationId, accessToken);
      } catch (error) {
        console.warn('Could not fetch follower stats:', error);
      }

      // Get page statistics
      let pageStats = null;
      try {
        pageStats = await this.getOrganizationPageStats(organizationId, accessToken);
      } catch (error) {
        console.warn('Could not fetch page stats:', error);
      }

      // Calculate basic metrics
      const postsCount = posts.elements?.length || 0;
      const followers = orgDetails.followerCount || 0;

      return {
        followers: followers,
        posts: postsCount,
        engagement: 0, // Would need additional API access for detailed engagement
        pageViews: 0, // Would need additional API access for page views
      };
    } catch (error) {
      console.error('Error fetching LinkedIn organization analytics:', error);
      throw error;
    }
  }

  /**
   * Refresh access token (LinkedIn uses OAuth 2.0)
   */
  async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string
  ): Promise<{
    access_token: string;
    expires_in: number;
    refresh_token: string;
  }> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`LinkedIn token refresh error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}