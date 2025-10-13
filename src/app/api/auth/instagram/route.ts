import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Instagram Basic Display API OAuth flow
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/instagram/callback`;

    if (!clientId) {
      return NextResponse.redirect(`${baseUrl}/settings?error=instagram_not_configured`);
    }

    const instagramAuthUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code`;

    return NextResponse.redirect(instagramAuthUrl);
  } catch (error) {
    console.error('Error initiating Instagram OAuth:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/settings?error=instagram_oauth_failed`);
  }
}

// Handle OAuth callback
export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_CLIENT_ID || '',
        client_secret: process.env.INSTAGRAM_CLIENT_SECRET || '',
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/api/auth/instagram/callback',
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Get user profile information
    const profileResponse = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`);
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const profileData = await profileResponse.json();

    // In a real implementation, save the token and user data to database
    console.log('Instagram connection successful:', {
      userId: profileData.id,
      username: profileData.username,
      accessToken: tokenData.access_token, // Should be encrypted in database
    });

    return NextResponse.json({
      success: true,
      user: {
        id: profileData.id,
        username: profileData.username,
        platform: 'instagram',
      },
    });
  } catch (error) {
    console.error('Error processing Instagram OAuth callback:', error);
    return NextResponse.json(
      { error: 'Failed to complete Instagram authentication' },
      { status: 500 }
    );
  }
}