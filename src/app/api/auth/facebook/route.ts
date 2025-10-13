import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.FACEBOOK_APP_ID;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/auth/facebook/callback`;

    if (!clientId) {
      return NextResponse.redirect(`${baseUrl}/settings?error=facebook_not_configured`);
    }

    // Facebook Graph API OAuth flow
    const facebookAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=pages_read_engagement,pages_show_list,read_insights&response_type=code`;

    return NextResponse.redirect(facebookAuthUrl);
  } catch (error) {
    console.error('Error initiating Facebook OAuth:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/settings?error=facebook_oauth_failed`);
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
    const redirectUri = `${baseUrl}/api/auth/facebook/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`);

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Get user's pages
    const pagesResponse = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`);
    
    if (!pagesResponse.ok) {
      throw new Error('Failed to fetch user pages');
    }

    const pagesData = await pagesResponse.json();

    return NextResponse.json({
      success: true,
      pages: pagesData.data,
      accessToken: tokenData.access_token,
    });
  } catch (error) {
    console.error('Error processing Facebook OAuth callback:', error);
    return NextResponse.json(
      { error: 'Failed to complete Facebook authentication' },
      { status: 500 }
    );
  }
}