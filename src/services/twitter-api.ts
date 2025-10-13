// Twitter API v2 Service
// Handles fetching user data and tweets from Twitter

import { getUserSocialTokens, updateAccountLastSync, storeSocialAnalytics } from '@/lib/social-tokens';

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  description?: string;
  profile_image_url?: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  verified?: boolean;
  verified_type?: string;
}

export interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
    bookmark_count: number;
    impression_count: number;
  };
  context_annotations?: any[];
  entities?: any;
}

export class TwitterAPI {
  private baseUrl = 'https://api.twitter.com/2';

  /**
   * Get authenticated user information
   */
  async getUserInfo(accessToken: string): Promise<{ data: TwitterUser }> {
    const userFields = 'id,name,username,description,profile_image_url,public_metrics,verified,verified_type';
    
    const response = await fetch(
      `${this.baseUrl}/users/me?user.fields=${userFields}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string, bearerToken: string): Promise<{ data: TwitterUser }> {
    const userFields = 'id,name,username,description,profile_image_url,public_metrics,verified,verified_type';
    
    const response = await fetch(
      `${this.baseUrl}/users/${userId}?user.fields=${userFields}`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user's tweets
   */
  async getUserTweets(
    userId: string,
    bearerToken: string,
    maxResults: number = 25
  ): Promise<{ data: TwitterTweet[]; meta: any }> {
    const tweetFields = 'id,text,created_at,author_id,public_metrics,context_annotations,entities';
    
    const response = await fetch(
      `${this.baseUrl}/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=${tweetFields}`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get tweet by ID with metrics
   */
  async getTweetById(tweetId: string, bearerToken: string): Promise<{ data: TwitterTweet }> {
    const tweetFields = 'id,text,created_at,author_id,public_metrics,context_annotations,entities';
    
    const response = await fetch(
      `${this.baseUrl}/tweets/${tweetId}?tweet.fields=${tweetFields}`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search recent tweets
   */
  async searchTweets(
    query: string,
    bearerToken: string,
    maxResults: number = 25
  ): Promise<{ data: TwitterTweet[]; meta: any }> {
    const tweetFields = 'id,text,created_at,author_id,public_metrics,context_annotations,entities';
    const userFields = 'id,name,username,profile_image_url';
    
    const response = await fetch(
      `${this.baseUrl}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&tweet.fields=${tweetFields}&expansions=author_id&user.fields=${userFields}`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Refresh OAuth 2.0 access token
   */
  async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string
  ): Promise<{
    token_type: string;
    expires_in: number;
    access_token: string;
    scope: string;
    refresh_token: string;
  }> {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error(`Twitter token refresh error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get analytics data for a specific user's connected Twitter account
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
      // Get stored Twitter tokens for the user
      const tokenData = await getUserSocialTokens(userId, 'TWITTER');
      
      if (!tokenData) {
        console.log(`No Twitter account connected for user ${userId}`);
        return null;
      }

      const analytics = await this.getAnalyticsData(tokenData.platformUserId, tokenData.accessToken);
      
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
      console.error(`Error fetching Twitter analytics for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get analytics data formatted for our database (using provided tokens)
   */
  async getAnalyticsData(userId: string, bearerToken: string): Promise<{
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
      // Get user info
      const userInfo = await this.getUserById(userId, bearerToken);
      const user = userInfo.data;

      // Get recent tweets
      const tweets = await this.getUserTweets(userId, bearerToken, 25);

      // Calculate engagement metrics
      let totalLikes = 0;
      let totalRetweets = 0;
      let totalReplies = 0;
      let totalImpressions = 0;
      let totalEngagement = 0;

      if (tweets.data) {
        for (const tweet of tweets.data) {
          const metrics = tweet.public_metrics;
          totalLikes += metrics.like_count;
          totalRetweets += metrics.retweet_count;
          totalReplies += metrics.reply_count;
          totalImpressions += metrics.impression_count;
          totalEngagement += metrics.like_count + metrics.retweet_count + metrics.reply_count + metrics.quote_count;
        }
      }

      // Calculate engagement rate
      const avgEngagementPerTweet = tweets.data?.length > 0 ? totalEngagement / tweets.data.length : 0;
      const engagementRate = user.public_metrics.followers_count > 0 
        ? (avgEngagementPerTweet / user.public_metrics.followers_count) * 100 
        : 0;

      return {
        followers: user.public_metrics.followers_count,
        following: user.public_metrics.following_count,
        posts: user.public_metrics.tweet_count,
        engagement: Math.round(engagementRate * 100) / 100,
        reach: Math.round(totalImpressions / (tweets.data?.length || 1)), // Avg reach per tweet
        impressions: totalImpressions,
        likes: totalLikes,
        comments: totalReplies,
        shares: totalRetweets,
      };
    } catch (error) {
      console.error('Error fetching Twitter analytics:', error);
      throw error;
    }
  }

  /**
   * Get tweet performance analytics
   */
  async getTweetAnalytics(tweetIds: string[], bearerToken: string): Promise<Array<{
    tweetId: string;
    metrics: any;
  }>> {
    const results = [];
    
    // Twitter API allows up to 100 tweet IDs per request
    const chunks = [];
    for (let i = 0; i < tweetIds.length; i += 100) {
      chunks.push(tweetIds.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      try {
        const idsParam = chunk.join(',');
        const tweetFields = 'id,public_metrics,created_at';
        
        const response = await fetch(
          `${this.baseUrl}/tweets?ids=${idsParam}&tweet.fields=${tweetFields}`,
          {
            headers: {
              'Authorization': `Bearer ${bearerToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            for (const tweet of data.data) {
              results.push({
                tweetId: tweet.id,
                metrics: tweet.public_metrics,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching tweet analytics for chunk:', error);
      }
    }

    return results;
  }

  /**
   * Get user mentions and interactions
   */
  async getUserMentions(userId: string, bearerToken: string, maxResults: number = 25): Promise<{
    data: TwitterTweet[];
    meta: any;
  }> {
    const tweetFields = 'id,text,created_at,author_id,public_metrics,context_annotations,entities';
    const userFields = 'id,name,username,profile_image_url';
    
    const response = await fetch(
      `${this.baseUrl}/users/${userId}/mentions?max_results=${maxResults}&tweet.fields=${tweetFields}&expansions=author_id&user.fields=${userFields}`,
      {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}