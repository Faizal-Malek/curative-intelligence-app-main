import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/twitter/callback`;

    if (!clientId) {
      return NextResponse.redirect(`${baseUrl}/settings?error=twitter_not_configured`);
    }

    // Twitter (X) API v2 OAuth 2.0 flow
    const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20users.read%20offline.access&state=state&code_challenge=challenge&code_challenge_method=plain`;

    return NextResponse.redirect(twitterAuthUrl);
  } catch (error) {
    console.error('Error initiating Twitter OAuth:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/settings?error=twitter_oauth_failed`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/twitter/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        client_id: process.env.TWITTER_CLIENT_ID || '',
        redirect_uri: redirectUri,
        code_verifier: 'challenge',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Get user information
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user information');
    }

    const userData = await userResponse.json();

    return NextResponse.json({
      success: true,
      user: userData.data,
      accessToken: tokenData.access_token,
    });
  } catch (error) {
    console.error('Error processing Twitter OAuth callback:', error);
    return NextResponse.json(
      { error: 'Failed to complete Twitter authentication' },
      { status: 500 }
    );
  }
}