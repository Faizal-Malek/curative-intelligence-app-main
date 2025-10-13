export type Metric = {
  id: string
  name: string
  value: string
  delta?: string
  description?: string
}

export type SocialMediaAnalytics = {
  platform: string
  followers: number
  posts: number
  engagement: number
  reach: number
  impressions: number
  lastSync: Date
}

// Fetch Instagram analytics
async function getInstagramAnalytics(accessToken: string): Promise<SocialMediaAnalytics | null> {
  try {
    // Get user media and insights
    const mediaResponse = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,timestamp,like_count,comments_count&access_token=${accessToken}`);
    const mediaData = await mediaResponse.json();

    // Get user info
    const userResponse = await fetch(`https://graph.instagram.com/me?fields=account_type,media_count&access_token=${accessToken}`);
    const userData = await userResponse.json();

    // Calculate engagement
    const totalLikes = mediaData.data?.reduce((sum: number, post: any) => sum + (post.like_count || 0), 0) || 0;
    const totalComments = mediaData.data?.reduce((sum: number, post: any) => sum + (post.comments_count || 0), 0) || 0;
    const totalEngagement = totalLikes + totalComments;
    const engagementRate = mediaData.data?.length ? (totalEngagement / mediaData.data.length) : 0;

    return {
      platform: 'Instagram',
      followers: 0, // Basic Display API doesn't provide follower count
      posts: userData.media_count || 0,
      engagement: engagementRate,
      reach: 0, // Requires Instagram Business Account
      impressions: 0, // Requires Instagram Business Account
      lastSync: new Date()
    };
  } catch (error) {
    console.error('Error fetching Instagram analytics:', error);
    return null;
  }
}

// Fetch Facebook analytics
async function getFacebookAnalytics(accessToken: string, pageId: string): Promise<SocialMediaAnalytics | null> {
  try {
    // Get page insights
    const insightsResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_fans,page_impressions,page_engaged_users&access_token=${accessToken}`);
    const insightsData = await insightsResponse.json();

    // Get posts
    const postsResponse = await fetch(`https://graph.facebook.com/v18.0/${pageId}/posts?fields=id,message,created_time&access_token=${accessToken}`);
    const postsData = await postsResponse.json();

    const followers = insightsData.data?.find((metric: any) => metric.name === 'page_fans')?.values?.[0]?.value || 0;
    const impressions = insightsData.data?.find((metric: any) => metric.name === 'page_impressions')?.values?.[0]?.value || 0;
    const engaged = insightsData.data?.find((metric: any) => metric.name === 'page_engaged_users')?.values?.[0]?.value || 0;

    return {
      platform: 'Facebook',
      followers: followers,
      posts: postsData.data?.length || 0,
      engagement: engaged,
      reach: 0, // Would need post-level insights
      impressions: impressions,
      lastSync: new Date()
    };
  } catch (error) {
    console.error('Error fetching Facebook analytics:', error);
    return null;
  }
}

// Fetch Twitter analytics
async function getTwitterAnalytics(accessToken: string, userId: string): Promise<SocialMediaAnalytics | null> {
  try {
    // Get user info with public metrics
    const userResponse = await fetch(`https://api.twitter.com/2/users/${userId}?user.fields=public_metrics`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const userData = await userResponse.json();

    // Get recent tweets
    const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=public_metrics&max_results=10`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const tweetsData = await tweetsResponse.json();

    const publicMetrics = userData.data?.public_metrics || {};
    const totalEngagement = tweetsData.data?.reduce((sum: number, tweet: any) => {
      const metrics = tweet.public_metrics || {};
      return sum + (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0);
    }, 0) || 0;

    return {
      platform: 'Twitter',
      followers: publicMetrics.followers_count || 0,
      posts: publicMetrics.tweet_count || 0,
      engagement: totalEngagement,
      reach: 0, // Not available in free tier
      impressions: 0, // Not available in free tier
      lastSync: new Date()
    };
  } catch (error) {
    console.error('Error fetching Twitter analytics:', error);
    return null;
  }
}

// Fetch LinkedIn analytics
async function getLinkedInAnalytics(accessToken: string): Promise<SocialMediaAnalytics | null> {
  try {
    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~:(id)', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const profileData = await profileResponse.json();

    // Note: LinkedIn requires Marketing API for advanced analytics
    // Basic profile API has limited analytics data
    
    return {
      platform: 'LinkedIn',
      followers: 0, // Requires Marketing API
      posts: 0, // Requires Marketing API
      engagement: 0, // Requires Marketing API
      reach: 0, // Requires Marketing API
      impressions: 0, // Requires Marketing API
      lastSync: new Date()
    };
  } catch (error) {
    console.error('Error fetching LinkedIn analytics:', error);
    return null;
  }
}

// Get all connected social media analytics
export async function getSocialMediaAnalytics(): Promise<SocialMediaAnalytics[]> {
  try {
    // In a real implementation, fetch connected accounts from database
    // For now, return empty array
    const connectedAccounts: any[] = []; // await getUserConnectedAccounts();
    
    const analyticsPromises = connectedAccounts.map(async (account: any) => {
      switch (account.platform) {
        case 'instagram':
          return getInstagramAnalytics(account.accessToken);
        case 'facebook':
          return getFacebookAnalytics(account.accessToken, account.pageId);
        case 'twitter':
          return getTwitterAnalytics(account.accessToken, account.userId);
        case 'linkedin':
          return getLinkedInAnalytics(account.accessToken);
        default:
          return null;
      }
    });

    const results = await Promise.all(analyticsPromises);
    return results.filter((result): result is SocialMediaAnalytics => result !== null);
  } catch (error) {
    console.error('Error fetching social media analytics:', error);
    return [];
  }
}

export function getMockAnalytics() {
  return {
    generatedPosts: 1280,
    publishedThisWeek: 84,
    engagementRate: 4.7, // percent
    topChannels: [
      { name: 'Twitter', percent: 42 },
      { name: 'LinkedIn', percent: 28 },
      { name: 'Facebook', percent: 15 },
      { name: 'Instagram', percent: 15 },
    ],
    metrics: [
      { id: 'm1', name: 'Generated Posts', value: '1,280', delta: '+12.3%' },
      { id: 'm2', name: 'Published This Week', value: '84', delta: '+4.1%' },
      { id: 'm3', name: 'Avg Engagement', value: '4.7%', delta: '+0.2%' },
      { id: 'm4', name: 'Conversion Rate', value: '1.8%', delta: '-0.1%' },
      { id: 'm5', name: 'Total Followers', value: '12.4K', delta: '+5.2%' },
      { id: 'm6', name: 'Total Reach', value: '45.2K', delta: '+8.1%' },
    ] as Metric[],
  }
}

// Enhanced analytics that combines mock data with real social media data
export async function getEnhancedAnalytics() {
  const mockData = getMockAnalytics();
  const socialMediaData = await getSocialMediaAnalytics();
  
  // Combine social media data with mock data
  if (socialMediaData.length > 0) {
    const totalFollowers = socialMediaData.reduce((sum, account) => sum + account.followers, 0);
    const totalEngagement = socialMediaData.reduce((sum, account) => sum + account.engagement, 0);
    const totalPosts = socialMediaData.reduce((sum, account) => sum + account.posts, 0);
    const totalImpressions = socialMediaData.reduce((sum, account) => sum + account.impressions, 0);
    
    // Update metrics with real data
    mockData.metrics = mockData.metrics.map(metric => {
      switch (metric.id) {
        case 'm5':
          return { ...metric, value: totalFollowers.toLocaleString() };
        case 'm6':
          return { ...metric, value: totalImpressions.toLocaleString() };
        default:
          return metric;
      }
    });
    
    // Update channel data based on connected platforms
    const platformChannels = socialMediaData.map(account => ({
      name: account.platform,
      percent: Math.round((account.followers / totalFollowers) * 100) || 0
    }));
    
    if (platformChannels.length > 0) {
      mockData.topChannels = platformChannels;
    }
  }
  
  return {
    ...mockData,
    socialMediaAccounts: socialMediaData,
    lastUpdated: new Date()
  };
}
