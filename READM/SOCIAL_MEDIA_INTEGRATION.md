# Social Media Integration Documentation

## Overview

This document outlines the social media integration capabilities of the Curative Intelligence App, including API limitations, requirements, and alternative approaches for connecting Instagram, Facebook, Twitter (X), and LinkedIn accounts.

## Supported Platforms

### 1. Instagram Integration

**API Used**: Instagram Basic Display API / Instagram Graph API

#### Requirements:
- Instagram Business Account (for advanced features)
- Facebook Developer Account
- App Review for production use

#### Available Metrics:
- ✅ Profile information (username, bio)
- ✅ Media posts (photos, videos)
- ✅ Basic engagement (likes, comments)
- ❌ Follower count (not available in Basic Display API)
- ❌ Story insights (requires Business Account + Graph API)
- ❌ Real-time analytics (requires webhook setup)

#### Limitations:
- **Basic Display API**: Limited to personal use, no business metrics
- **Graph API**: Requires Instagram Business Account and Facebook Page
- **Rate Limits**: 200 requests per hour per user
- **Data Retention**: 60 days for insights data
- **App Review**: Required for production access to advanced permissions

#### Alternative Approaches:
1. **Manual CSV Import**: Allow users to upload Instagram analytics exports
2. **Third-party APIs**: Consider services like Sprout Social API or Hootsuite API
3. **Screen Scraping** (Not recommended): Violates Terms of Service

### 2. Facebook Integration

**API Used**: Facebook Graph API

#### Requirements:
- Facebook Page (not personal profile)
- Facebook Developer Account
- App Review for advanced permissions

#### Available Metrics:
- ✅ Page followers and fans
- ✅ Post engagement (likes, comments, shares)
- ✅ Page impressions and reach
- ✅ Audience demographics
- ✅ Video views and completion rates

#### Limitations:
- **Personal Profiles**: No access to personal profile analytics
- **App Review**: Required for `pages_read_engagement` permission
- **Rate Limits**: 600 requests per hour per app
- **Historical Data**: Limited to 2 years
- **Live Events**: Requires special permissions

#### Alternative Approaches:
1. **Facebook Business Manager Export**: Manual CSV/Excel exports
2. **Meta Business API**: For enterprise customers
3. **Third-party Analytics Tools**: Buffer, Socialbakers, etc.

### 3. Twitter (X) Integration

**API Used**: Twitter API v2

#### Requirements:
- Twitter Developer Account
- App approval (automated for most use cases)
- Different access levels (Essential, Elevated, Academic)

#### Available Metrics:
- ✅ Profile information and public metrics
- ✅ Tweet engagement (likes, retweets, replies)
- ✅ Follower count and following count
- ❌ Tweet impressions (requires Elevated access)
- ❌ Advanced analytics (requires paid API access)

#### Limitations:
- **Essential Access** (Free): 2M tweets per month, basic metrics only
- **Elevated Access**: Required for advanced metrics and higher limits
- **Academic Access**: For research purposes only
- **Real-time Streaming**: Separate limits and pricing

#### API Pricing:
- **Free Tier**: Essential access with basic features
- **Basic Tier**: $100/month for enhanced features
- **Pro Tier**: $5,000/month for advanced analytics

#### Alternative Approaches:
1. **Twitter Analytics Export**: Manual data export from Twitter Analytics
2. **TweetDeck**: For basic monitoring and scheduling
3. **Third-party Tools**: Sprout Social, Hootsuite, Buffer

### 4. LinkedIn Integration

**API Used**: LinkedIn Marketing API / LinkedIn API

#### Requirements:
- LinkedIn Developer Account
- LinkedIn Marketing API access (requires approval)
- LinkedIn Partner Program membership (for advanced features)

#### Available Metrics:
- ✅ Profile information
- ❌ Company page analytics (requires Marketing API)
- ❌ Post performance metrics (requires special permissions)
- ❌ Follower demographics (Marketing API only)

#### Limitations:
- **Personal Profiles**: Very limited analytics access
- **Company Pages**: Requires Marketing API access
- **Partner Program**: Many features require LinkedIn Partner status
- **Rate Limits**: Strict limits on API calls
- **Approval Process**: Can take weeks to months

#### Alternative Approaches:
1. **LinkedIn Page Insights Export**: Manual download from LinkedIn Analytics
2. **LinkedIn Sales Navigator**: For lead generation data
3. **Third-party LinkedIn Tools**: Shield, Hootsuite LinkedIn integration

## Implementation Strategy

### Phase 1: Basic Integration (Current)
- ✅ OAuth authentication flows for all platforms
- ✅ Basic profile information and connection status
- ✅ Mock data display in analytics dashboard
- ✅ Database schema for storing connection tokens

### Phase 2: Real Data Integration
- [ ] Implement actual API calls for each platform
- [ ] Set up secure token storage and encryption
- [ ] Create data synchronization jobs
- [ ] Handle API rate limiting and error recovery

### Phase 3: Advanced Features
- [ ] Historical data import and analysis
- [ ] Cross-platform analytics comparison
- [ ] Automated content scheduling
- [ ] AI-powered content recommendations based on performance

## Security Considerations

### Token Storage
- **Encryption**: All access tokens must be encrypted at rest
- **Rotation**: Implement automatic token refresh where supported
- **Expiration**: Handle token expiration gracefully
- **Revocation**: Allow users to disconnect accounts and revoke tokens

### Data Privacy
- **GDPR Compliance**: Ensure proper data handling for EU users
- **User Consent**: Clear consent for data collection and usage
- **Data Retention**: Implement policies for data cleanup
- **Third-party Sharing**: No sharing of user data with unauthorized parties

## Development Setup

### Environment Variables Required

```env
# Instagram
INSTAGRAM_CLIENT_ID=your_instagram_client_id
INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback

# Facebook
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback

# Twitter
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
TWITTER_REDIRECT_URI=http://localhost:3000/api/auth/twitter/callback

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
```

### Setting Up Developer Accounts

#### Instagram/Facebook
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Instagram Basic Display product
4. Configure OAuth redirect URIs
5. Submit for app review (for production)

#### Twitter
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Apply for developer account
3. Create a new app
4. Configure OAuth 2.0 settings
5. Apply for Elevated access if needed

#### LinkedIn
1. Go to [LinkedIn Developers](https://developer.linkedin.com/)
2. Create a new app
3. Request Marketing API access
4. Configure OAuth settings
5. Submit for review

## Testing Strategy

### Unit Tests
- API authentication flows
- Token refresh mechanisms
- Data parsing and validation
- Error handling scenarios

### Integration Tests
- End-to-end OAuth flows
- Real API data fetching
- Rate limit handling
- Data synchronization accuracy

### User Acceptance Testing
- Connection/disconnection workflows
- Analytics data accuracy
- Performance with multiple connected accounts
- Error messaging and recovery

## Monitoring and Maintenance

### API Health Monitoring
- Track API response times and error rates
- Monitor rate limit usage
- Alert on authentication failures
- Track data synchronization success rates

### Performance Optimization
- Cache frequently accessed data
- Implement efficient data pagination
- Optimize database queries
- Use background jobs for heavy operations

## Troubleshooting Common Issues

### Authentication Failures
- **Invalid Redirect URI**: Ensure URIs match exactly in developer console
- **Scope Permissions**: Verify all required permissions are requested
- **App Review Status**: Check if app is approved for production use
- **Token Expiration**: Implement proper token refresh logic

### API Rate Limiting
- **Instagram**: 200 requests/hour - implement request queuing
- **Facebook**: 600 requests/hour - batch requests where possible
- **Twitter**: Various limits by endpoint - use efficient data fetching
- **LinkedIn**: Strict limits - cache data aggressively

### Data Inconsistencies
- **Time Zone Issues**: Always use UTC for timestamps
- **Metric Definitions**: Different platforms calculate metrics differently
- **Historical Data**: Some platforms have limited historical data access
- **Real-time Updates**: Not all platforms support real-time data

## Future Enhancements

### Additional Platforms
- TikTok for Business API
- YouTube Analytics API
- Pinterest Analytics API
- Snapchat Marketing API

### Advanced Analytics
- Cross-platform performance comparison
- Content performance prediction
- Optimal posting time recommendations
- Audience overlap analysis

### Automation Features
- Automated content scheduling
- Performance-based content optimization
- A/B testing for social media posts
- AI-generated content suggestions

## Support and Resources

### Official Documentation
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Facebook Graph API](https://developers.facebook.com/docs/graph-api/)
- [Twitter API v2](https://developer.twitter.com/en/docs/twitter-api)
- [LinkedIn Marketing API](https://docs.microsoft.com/en-us/linkedin/marketing/)

### Community Resources
- Stack Overflow with platform-specific tags
- Reddit communities for each platform
- Developer Discord servers
- Official developer forums

---

**Note**: This integration is designed to provide comprehensive social media analytics while respecting platform terms of service and user privacy. Always ensure compliance with the latest API terms and conditions for each platform.