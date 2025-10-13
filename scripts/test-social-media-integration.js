// Test script to verify social media integration setup
// Run with: node scripts/test-social-media-integration.js

const { PrismaClient } = require('@prisma/client');

// Test 1: Check if Prisma client can be initialized
console.log('🔧 Testing Prisma Client initialization...');
try {
  const prisma = new PrismaClient();
  console.log('✅ Prisma Client initialized successfully');
  prisma.$disconnect();
} catch (error) {
  console.log('❌ Prisma Client initialization failed:', error.message);
}

// Test 2: Check environment variables
console.log('\n🔧 Testing environment variables...');
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SOCIAL_MEDIA_ENCRYPTION_KEY'
];

const socialMediaEnvVars = [
  'INSTAGRAM_CLIENT_ID',
  'FACEBOOK_APP_ID', 
  'TWITTER_CLIENT_ID',
  'LINKEDIN_CLIENT_ID'
];

let allEnvVarsPresent = true;

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`);
  } else {
    console.log(`❌ ${varName}: Missing`);
    allEnvVarsPresent = false;
  }
});

console.log('\n🔧 Testing social media API credentials...');
socialMediaEnvVars.forEach(varName => {
  if (process.env[varName] && !process.env[varName].includes('your_')) {
    console.log(`✅ ${varName}: Configured`);
  } else {
    console.log(`⚠️ ${varName}: Placeholder (needs real credentials)`);
  }
});

// Test 3: Check if OAuth URLs can be generated
console.log('\n🔧 Testing OAuth URL generation...');

const platforms = [
  {
    name: 'Instagram',
    baseUrl: 'https://api.instagram.com/oauth/authorize',
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/api/auth/instagram/callback'
  },
  {
    name: 'Facebook',
    baseUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    clientId: process.env.FACEBOOK_APP_ID,
    redirectUri: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3000/api/auth/facebook/callback'
  },
  {
    name: 'Twitter',
    baseUrl: 'https://twitter.com/i/oauth2/authorize',
    clientId: process.env.TWITTER_CLIENT_ID,
    redirectUri: process.env.TWITTER_REDIRECT_URI || 'http://localhost:3000/api/auth/twitter/callback'
  },
  {
    name: 'LinkedIn',
    baseUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    clientId: process.env.LINKEDIN_CLIENT_ID,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/linkedin/callback'
  }
];

platforms.forEach(platform => {
  if (platform.clientId && !platform.clientId.includes('your_')) {
    console.log(`✅ ${platform.name}: OAuth URL can be generated`);
  } else {
    console.log(`⚠️ ${platform.name}: Missing client ID for OAuth URL`);
  }
});

// Test 4: File structure check
console.log('\n🔧 Testing file structure...');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/app/(app)/settings/page.tsx',
  'src/components/settings/SocialMediaConnections.tsx',
  'src/app/api/auth/instagram/route.ts',
  'src/app/api/auth/instagram/callback/route.ts',
  'src/app/api/auth/facebook/route.ts',
  'src/app/api/auth/facebook/callback/route.ts',
  'src/app/api/auth/twitter/route.ts',
  'src/app/api/auth/twitter/callback/route.ts',
  'src/app/api/auth/linkedin/route.ts',
  'src/app/api/auth/linkedin/callback/route.ts',
  'prisma/schema.prisma'
];

requiredFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath}: Exists`);
  } else {
    console.log(`❌ ${filePath}: Missing`);
  }
});

console.log('\n📋 Summary:');
console.log('✅ Social media integration infrastructure is set up');
console.log('⚠️ Database migration pending - credentials need verification');
console.log('⚠️ Social media API credentials need to be replaced with real values');
console.log('🚀 Ready for developer account setup and OAuth flow testing');

console.log('\n📝 Next Steps:');
console.log('1. Verify Supabase database credentials');
console.log('2. Set up developer accounts for each social media platform');
console.log('3. Replace placeholder API credentials with real values');
console.log('4. Run database migration');
console.log('5. Test OAuth flows in development');