# 🚀 Real API Integration: Complete Walkthrough

## How Real Data Flows Through Your App

This guide shows exactly how your social media integration works when you add real API credentials and connect accounts.

---

## 📋 **Step-by-Step Data Flow**

### **Phase 1: API Credentials Setup**

#### 1.1 Instagram Setup Example
```bash
# What you'll get from Facebook Developer Console
INSTAGRAM_CLIENT_ID=123456789012345
INSTAGRAM_CLIENT_SECRET=abcdef1234567890abcdef1234567890
```

#### 1.2 How It Works Internally
When a user clicks "Connect Instagram":

```typescript
// 1. User clicks Connect → Redirects to Instagram OAuth
GET /api/auth/instagram
→ Redirects to: https://api.instagram.com/oauth/authorize?
  client_id=123456789012345&
  redirect_uri=http://localhost:3000/api/auth/instagram/callback&
  scope=user_profile,user_media&
  response_type=code

// 2. User authorizes → Instagram redirects back with code
GET /api/auth/instagram/callback?code=ABC123...

// 3. Your app exchanges code for access token
POST https://api.instagram.com/oauth/access_token
Body: {
  client_id: 123456789012345,
  client_secret: abcdef1234567890abcdef1234567890,
  code: ABC123...,
  grant_type: authorization_code
}
Response: {
  access_token: "IGQVJXabc123...",
  user_id: "987654321"
}
```

---

## 🔄 **Real Data Fetching Process**

### **Phase 2: Automatic Data Collection**

Once connected, here's what happens when your app fetches real analytics:

#### 2.1 Instagram Data Fetching
```typescript
// Your app automatically calls our InstagramAPI service
const instagramAPI = new InstagramAPI();

// Step 1: Get user profile
const profile = await instagramAPI.getUserProfile(accessToken);
// Returns: { id, username, account_type, media_count }

// Step 2: Get recent media posts
const media = await instagramAPI.getUserMedia(accessToken, 25);
// Returns: [{ id, media_type, media_url, caption, timestamp }...]

// Step 3: Get analytics insights (if business account)
const insights = await instagramAPI.getAccountInsights(accessToken);
// Returns: { impressions, reach, profile_views }

// Step 4: Calculate engagement metrics
const analytics = await instagramAPI.getAnalyticsData(accessToken);
// Returns: {
//   followers: 0, // Instagram Basic Display doesn't provide this
//   posts: 47,
//   engagement: 3.2, // Calculated from recent posts
//   reach: 1250,
//   impressions: 3400
// }
```

#### 2.2 Facebook Data Fetching
```typescript
const facebookAPI = new FacebookAPI();

// Step 1: Get user's pages
const pages = await facebookAPI.getUserPages(accessToken);
// Returns: [{ id, name, fan_count, category }...]

// Step 2: Get page insights  
const insights = await facebookAPI.getPageInsights(pageId, pageToken);
// Returns: { page_impressions, page_reach, page_engaged_users }

// Step 3: Get recent posts
const posts = await facebookAPI.getPagePosts(pageId, pageToken);
// Returns: [{ id, message, likes, comments, shares }...]

// Final analytics:
// {
//   followers: 2340,
//   posts: 156,
//   engagement: 4.7,
//   reach: 8900,
//   impressions: 25600,
//   likes: 1200,
//   comments: 89,
//   shares: 45
// }
```

#### 2.3 Twitter Data Fetching
```typescript
const twitterAPI = new TwitterAPI();

// Step 1: Get user info
const user = await twitterAPI.getUserInfo(accessToken);
// Returns: { id, username, public_metrics: { followers_count, tweet_count }}

// Step 2: Get recent tweets
const tweets = await twitterAPI.getUserTweets(userId, bearerToken);
// Returns: [{ id, text, public_metrics: { like_count, retweet_count }}...]

// Final analytics:
// {
//   followers: 5670,
//   following: 890,
//   posts: 1230,
//   engagement: 2.8,
//   likes: 450,
//   comments: 67, // replies
//   shares: 123  // retweets
// }
```

---

## 🎯 **What You'll See in Your App**

### **Phase 3: Real Dashboard Data**

#### 3.1 Settings Page After Connection
```
┌─────────────────────────────────────┐
│ Social Media Connections            │
├─────────────────────────────────────┤
│ 🟢 Instagram  @yourhandle           │
│    15,420 followers • 2 hours ago   │
│    [Disconnect]                     │
├─────────────────────────────────────┤
│ 🟢 Facebook   Your Page Name        │
│    2,340 followers • 1 hour ago     │
│    [Disconnect]                     │
├─────────────────────────────────────┤
│ 🟢 Twitter    @yourusername         │
│    5,670 followers • 30 min ago     │
│    [Disconnect]                     │
├─────────────────────────────────────┤
│ 🔴 LinkedIn   Not Connected         │
│    [Connect LinkedIn]               │
└─────────────────────────────────────┘
```

#### 3.2 Dashboard Analytics Display
```
┌─────────────────────────────────────┐
│ 📊 Social Media Analytics           │
├─────────────────────────────────────┤
│ Total Followers: 23,430             │
│ Total Posts: 1,433                  │
│ Avg Engagement: 3.6%                │
│ Monthly Reach: 156,890              │
├─────────────────────────────────────┤
│ Platform Breakdown:                 │
│ • Instagram: 15,420 followers       │
│ • Facebook:  2,340 followers        │
│ • Twitter:   5,670 followers        │
│ • LinkedIn:  Not connected          │
└─────────────────────────────────────┘
```

---

## 🔧 **Testing Real APIs Right Now**

You can test the API infrastructure immediately:

### Test 1: Check API Service Instantiation
```bash
# Test if APIs can be created (they can!)
curl http://localhost:3000/api/social-media/test-connection
```

### Test 2: Simulate Real Data
```bash
# Create a test script to see how real data would flow
node -e "
const { InstagramAPI } = require('./src/services/instagram-api.ts');
console.log('Instagram API ready:', new InstagramAPI() ? 'Yes' : 'No');
"
```

---

## 📱 **Step-by-Step: Get Your First Real Data**

### **Quick Start: Instagram in 15 Minutes**

#### Step 1: Create Facebook App
1. Go to https://developers.facebook.com/
2. Click "Create App" → "Consumer"
3. App Name: "Curative Intelligence"
4. Add "Instagram Basic Display" product

#### Step 2: Configure App
```
App Dashboard → Instagram Basic Display → Basic Display
└── Valid OAuth Redirect URIs: 
    http://localhost:3000/api/auth/instagram/callback
```

#### Step 3: Get Credentials
```
App Dashboard → Settings → Basic
├── App ID: 123456789012345
└── App Secret: abcdef1234567890...
```

#### Step 4: Update Environment
```bash
# Replace in .env.local
INSTAGRAM_CLIENT_ID=123456789012345
INSTAGRAM_CLIENT_SECRET=abcdef1234567890abcdef1234567890
```

#### Step 5: Test Connection
```bash
# Restart dev server
npm run dev

# Visit settings page
http://localhost:3000/settings

# Click "Connect Instagram"
# → Complete OAuth flow
# → See real Instagram data!
```

---

## 🔄 **Automated Data Synchronization**

### **How Background Jobs Will Work** (Ready to Implement)

```typescript
// Every hour, automatically refresh all connected accounts
async function syncAllAccounts() {
  // 1. Get all active connections from database
  const accounts = await prisma.socialMediaAccount.findMany({
    where: { isActive: true }
  });

  // 2. Fetch fresh analytics for each
  const results = await socialMediaService.getMultipleAccountAnalytics(accounts);

  // 3. Save to database
  for (const analytics of results.successful) {
    await prisma.socialMediaAnalytics.create({
      data: {
        accountId: analytics.accountId,
        date: new Date(),
        followers: analytics.followers,
        engagement: analytics.engagement,
        reach: analytics.reach,
        // ... all metrics
      }
    });
  }

  console.log(`Synced ${results.successful.length} accounts`);
}

// Schedule every hour
setInterval(syncAllAccounts, 60 * 60 * 1000);
```

---

## 📊 **Real API Response Examples**

### Instagram Real Response
```json
{
  "id": "17841405822304914",
  "username": "curative_intelligence",
  "account_type": "BUSINESS",
  "media_count": 47,
  "analytics": {
    "followers": 0,
    "posts": 47,
    "engagement": 3.2,
    "reach": 1250,
    "impressions": 3400
  }
}
```

### Facebook Real Response
```json
{
  "id": "104649421753075",
  "name": "Curative Intelligence",
  "fan_count": 2340,
  "analytics": {
    "followers": 2340,
    "posts": 156,
    "engagement": 4.7,
    "reach": 8900,
    "impressions": 25600,
    "likes": 1200,
    "comments": 89,
    "shares": 45
  }
}
```

---

## 🚀 **Your Next Actions**

### **Immediate (5 minutes)**
1. Pick one platform (Instagram is easiest)
2. Create developer account
3. Get API credentials
4. Update `.env.local`

### **Short Term (30 minutes)**
1. Test OAuth flow with real credentials
2. See your real social media data
3. Verify analytics accuracy

### **Long Term (1 hour)**
1. Connect all 4 platforms
2. Set up database (fix credentials)
3. Enable automatic data sync

---

## 🎯 **Success Indicators**

You'll know it's working when:
- ✅ Settings page shows "Connected" with your real username
- ✅ Dashboard displays your actual follower counts
- ✅ Analytics show real engagement rates
- ✅ Data updates automatically

**Your real social media analytics platform is just API credentials away!** 🚀

Ready to get started with your first platform?