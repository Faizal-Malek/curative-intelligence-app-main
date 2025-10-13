import { NextRequest, NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (error) {
      console.error('Twitter OAuth error:', error, errorDescription);
      return redirect(`${baseUrl}/settings?error=twitter_auth_failed&message=` + encodeURIComponent(errorDescription || 'Authentication failed'));
    }

    if (!code) {
      return redirect(`${baseUrl}/settings?error=twitter_auth_failed&message=` + encodeURIComponent('No authorization code received'));
    }

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
        code_verifier: 'challenge', // In production, this should be stored securely
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Failed to exchange Twitter code for token:', errorData);
      return redirect(`${baseUrl}/settings?error=twitter_token_exchange_failed&message=` + encodeURIComponent('Failed to exchange authorization code'));
    }

    const tokenData = await tokenResponse.json();

    // Get user information
    const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics,profile_image_url,username', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('Failed to fetch Twitter user information:', errorData);
      return redirect(`${baseUrl}/settings?error=twitter_user_failed&message=` + encodeURIComponent('Failed to fetch user information'));
    }

    const userData = await userResponse.json();

    // TODO: Save the connection to database
    // const user = await getCurrentUser();
    // await prisma.socialMediaAccount.upsert({
    //   where: {
    //     userId_platform: {
    //       userId: user.id,
    //       platform: 'TWITTER'
    //     }
    //   },
    //   update: {
    //     accessToken: tokenData.access_token, // Should be encrypted
    //     refreshToken: tokenData.refresh_token, // Should be encrypted
    //     username: `@${userData.data.username}`,
    //     platformUserId: userData.data.id,
    //     profileImage: userData.data.profile_image_url,
    //     followerCount: userData.data.public_metrics?.followers_count,
    //     tokenExpiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
    //     isActive: true,
    //     lastSync: new Date()
    //   },
    //   create: {
    //     userId: user.id,
    //     platform: 'TWITTER',
    //     accessToken: tokenData.access_token, // Should be encrypted
    //     refreshToken: tokenData.refresh_token, // Should be encrypted
    //     username: `@${userData.data.username}`,
    //     platformUserId: userData.data.id,
    //     profileImage: userData.data.profile_image_url,
    //     followerCount: userData.data.public_metrics?.followers_count,
    //     tokenExpiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
    //     isActive: true,
    //     lastSync: new Date()
    //   }
    // });

    console.log('Twitter connection successful:', {
      userId: userData.data.id,
      username: userData.data.username,
      followers: userData.data.public_metrics?.followers_count,
      // accessToken is logged for development only - remove in production
    });

    return redirect(`${baseUrl}/settings?success=twitter_connected&username=` + encodeURIComponent(`@${userData.data.username}`));
  } catch (error) {
    console.error('Error processing Twitter OAuth callback:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return redirect(`${baseUrl}/settings?error=twitter_callback_error&message=` + encodeURIComponent('Internal server error'));
  }
}