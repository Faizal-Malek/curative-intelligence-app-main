# Social Media Integration Developer Account Setup Guide

This guide will walk you through setting up developer accounts for Instagram, Facebook, Twitter, and LinkedIn to enable OAuth authentication in your Curative Intelligence app.

## 🚀 Quick Start Checklist

- [ ] Instagram Basic Display API setup
- [ ] Facebook App creation 
- [ ] Twitter API v2 setup
- [ ] LinkedIn Developer App creation
- [ ] Environment variables configuration
- [ ] Database migration
- [ ] OAuth flow testing

## 📱 Instagram Basic Display API Setup

### Step 1: Create a Facebook Developer Account
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Get Started" and log in with your Facebook account
3. Complete the developer account verification process

### Step 2: Create a New App
1. Click "Create App" → "Consumer" → "Next"
2. App Name: "Curative Intelligence"
3. App Contact Email: Your email address
4. Click "Create App"

### Step 3: Add Instagram Basic Display Product
1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. Go to Instagram Basic Display → Basic Display → Settings

### Step 4: Configure App Settings
1. **Display Name**: Curative Intelligence
2. **User Token Generator**: 
   - Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/instagram/callback`
   - For production: `https://yourdomain.com/api/auth/instagram/callback`
3. **Deauthorize Callback URL**: `http://localhost:3000/api/auth/instagram/deauth`
4. **Data Deletion Request URL**: `http://localhost:3000/api/auth/instagram/delete`

### Step 5: Get Your Credentials
```bash
# Copy these to your .env.local file
INSTAGRAM_CLIENT_ID=your_instagram_app_id_here
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret_here
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback
```

### Step 6: Add Test Users (Development)
1. Go to Roles → Roles
2. Add Instagram accounts that can test the integration
3. Accept the invitation in the Instagram app

---

## 📘 Facebook Graph API Setup

### Step 1: Use the Same App from Instagram Setup
Since Instagram is owned by Facebook, you can use the same app for both platforms.

### Step 2: Add Facebook Login Product
1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" platform

### Step 3: Configure Facebook Login Settings
1. Go to Facebook Login → Settings
2. **Valid OAuth Redirect URIs**: 
   - `http://localhost:3000/api/auth/facebook/callback`
   - For production: `https://yourdomain.com/api/auth/facebook/delete`
3. **Deauthorize Callback URL**: `http://localhost:3000/api/auth/facebook/deauth`

### Step 4: App Review (For Production)
For accessing public content and pages, you'll need to submit for app review:
1. Go to App Review → Permissions and Features
2. Request permissions for:
   - `pages_show_list`
   - `pages_read_engagement` 
   - `read_insights`

### Step 5: Get Your Credentials
```bash
# Your Facebook App ID and Secret are the same as Instagram
FACEBOOK_APP_ID=your_instagram_app_id_here
FACEBOOK_APP_SECRET=your_instagram_app_secret_here
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback
```

---

## 🐦 Twitter API v2 Setup

### Step 1: Create a Twitter Developer Account
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Click "Sign up" and log in with your Twitter account
3. Apply for a developer account:
   - Account type: "Making a bot or hobby app"
   - Use case: "Analytics and insights for social media management"
   - Will you make Twitter content available to government entities: "No"

### Step 2: Create a New Project and App
1. After approval, click "Create Project"
2. **Project Name**: "Curative Intelligence Analytics"
3. **Use Case**: "Analytics and insights"
4. **Project Description**: "Social media analytics and content management platform"
5. **App Name**: "curative-intelligence-app"

### Step 3: Configure App Settings
1. Go to your app → "App settings"
2. **App permissions**: "Read"
3. **Type of App**: "Web App"
4. **Callback URLs**: `http://localhost:3000/api/auth/twitter/callback`
5. **Website URL**: `http://localhost:3000` (or your production URL)

### Step 4: Enable OAuth 2.0
1. Go to "User authentication settings"
2. **OAuth 2.0**: Enable
3. **Type of App**: "Web App"
4. **Callback URLs**: `http://localhost:3000/api/auth/twitter/callback`
5. **Website URL**: `http://localhost:3000`

### Step 5: Get Your Credentials
```bash
# Copy these to your .env.local file
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
TWITTER_REDIRECT_URI=http://localhost:3000/api/auth/twitter/callback
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
```

### Step 6: Generate Bearer Token (For API v2)
1. Go to "Keys and tokens"
2. Generate "Bearer Token"
3. Copy the bearer token for API calls

---

## 💼 LinkedIn Marketing API Setup

### Step 1: Create a LinkedIn Developer Account
1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Click "Create app" and sign in with your LinkedIn account
3. You may need to create a LinkedIn Company Page first

### Step 2: Create a New App
1. **App name**: "Curative Intelligence"
2. **LinkedIn Page**: Select your company page (create one if needed)
3. **Privacy policy URL**: `http://localhost:3000/privacy` (create this page)
4. **App logo**: Upload your app logo (optional but recommended)
5. **Legal agreement**: Accept the terms

### Step 3: Configure App Settings
1. Go to "Auth" tab
2. **Authorized redirect URLs**: `http://localhost:3000/api/auth/linkedin/callback`
3. For production: `https://yourdomain.com/api/auth/linkedin/callback`

### Step 4: Request API Access
1. Go to "Products" tab
2. Request access to:
   - **Marketing Developer Platform** (for analytics)
   - **Share on LinkedIn** (for content posting)
   - **Sign In with LinkedIn using OpenID Connect** (for authentication)

### Step 5: Get Your Credentials
```bash
# Copy these to your .env.local file
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback
```

### Step 6: Verification Process
LinkedIn requires verification for production apps:
1. Complete app information
2. Provide detailed use case description
3. Wait for approval (usually 1-2 business days)

---

## 🔧 Final Configuration Steps

### Step 1: Update Environment Variables
After getting all your credentials, update your `.env.local` file:

```bash
# Instagram/Facebook (same app)
INSTAGRAM_CLIENT_ID=1234567890123456
INSTAGRAM_CLIENT_SECRET=abcdef1234567890abcdef1234567890
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890

# Twitter
TWITTER_CLIENT_ID=your_actual_twitter_client_id
TWITTER_CLIENT_SECRET=your_actual_twitter_client_secret
TWITTER_BEARER_TOKEN=your_actual_bearer_token

# LinkedIn
LINKEDIN_CLIENT_ID=your_actual_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_actual_linkedin_client_secret
```

### Step 2: Run Database Migration
```bash
npx prisma db push
```

### Step 3: Test OAuth Flows
1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/settings`
3. Click "Connect" for each platform
4. Complete the OAuth flow
5. Verify the connection is successful

### Step 4: Verify API Access
After connecting accounts, test API calls:
```bash
node scripts/test-social-media-integration.js
```

---

## 🚨 Important Security Notes

1. **Never commit real API keys** to version control
2. **Use environment variables** for all sensitive data
3. **Enable HTTPS** in production
4. **Regularly rotate** API keys and secrets
5. **Implement token encryption** before production
6. **Set up proper CORS** policies
7. **Monitor API usage** and rate limits

---

## 🐛 Common Issues and Solutions

### Instagram/Facebook Issues
- **Invalid redirect URI**: Ensure exact match including trailing slashes
- **App not approved**: Use test users during development
- **Scope permissions**: Request only necessary permissions

### Twitter Issues
- **Callback URL mismatch**: Check exact URL in developer portal
- **Rate limiting**: Implement proper request throttling
- **App permissions**: Ensure "Read" permission is enabled

### LinkedIn Issues
- **App approval pending**: Use development mode until approved
- **Company page required**: Create a LinkedIn company page first
- **API access**: Request appropriate products for your use case

### Database Issues
- **Connection failed**: Verify Supabase credentials
- **Migration errors**: Check database permissions
- **Schema conflicts**: Drop and recreate tables if needed

---

## 📞 Support Resources

- **Instagram**: [Instagram Basic Display API Docs](https://developers.facebook.com/docs/instagram-basic-display-api/)
- **Facebook**: [Facebook Graph API Docs](https://developers.facebook.com/docs/graph-api/)
- **Twitter**: [Twitter API v2 Docs](https://developer.twitter.com/en/docs/twitter-api)
- **LinkedIn**: [LinkedIn Marketing API Docs](https://docs.microsoft.com/en-us/linkedin/)

Ready to start connecting your social media accounts! 🚀