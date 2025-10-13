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
      console.error('LinkedIn OAuth error:', error, errorDescription);
      return redirect(`${baseUrl}/settings?error=linkedin_auth_failed&message=` + encodeURIComponent(errorDescription || 'Authentication failed'));
    }

    if (!code) {
      return redirect(`${baseUrl}/settings?error=linkedin_auth_failed&message=` + encodeURIComponent('No authorization code received'));
    }

    const redirectUri = `${baseUrl}/api/auth/linkedin/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID || '',
        client_secret: process.env.LINKEDIN_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Failed to exchange LinkedIn code for token:', errorData);
      return redirect(`${baseUrl}/settings?error=linkedin_token_exchange_failed&message=` + encodeURIComponent('Failed to exchange authorization code'));
    }

    const tokenData = await tokenResponse.json();

    // Get user profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorData = await profileResponse.text();
      console.error('Failed to fetch LinkedIn user profile:', errorData);
      return redirect(`${baseUrl}/settings?error=linkedin_profile_failed&message=` + encodeURIComponent('Failed to fetch user profile'));
    }

    const profileData = await profileResponse.json();

    // TODO: Save the connection to database
    // const user = await getCurrentUser();
    // const displayName = `${profileData.firstName?.localized?.en_US || ''} ${profileData.lastName?.localized?.en_US || ''}`.trim();
    // const profileImageUrl = profileData.profilePicture?.displayImage?.['~']?.elements?.[0]?.identifiers?.[0]?.identifier;
    // 
    // await prisma.socialMediaAccount.upsert({
    //   where: {
    //     userId_platform: {
    //       userId: user.id,
    //       platform: 'LINKEDIN'
    //     }
    //   },
    //   update: {
    //     accessToken: tokenData.access_token, // Should be encrypted
    //     displayName: displayName,
    //     platformUserId: profileData.id,
    //     profileImage: profileImageUrl,
    //     tokenExpiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
    //     isActive: true,
    //     lastSync: new Date()
    //   },
    //   create: {
    //     userId: user.id,
    //     platform: 'LINKEDIN',
    //     accessToken: tokenData.access_token, // Should be encrypted
    //     displayName: displayName,
    //     platformUserId: profileData.id,
    //     profileImage: profileImageUrl,
    //     tokenExpiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
    //     isActive: true,
    //     lastSync: new Date()
    //   }
    // });

    const displayName = `${profileData.firstName?.localized?.en_US || ''} ${profileData.lastName?.localized?.en_US || ''}`.trim();
    
    console.log('LinkedIn connection successful:', {
      userId: profileData.id,
      displayName: displayName,
      // accessToken is logged for development only - remove in production
    });

    return redirect(`${baseUrl}/settings?success=linkedin_connected&name=` + encodeURIComponent(displayName));
  } catch (error) {
    console.error('Error processing LinkedIn OAuth callback:', error);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return redirect(`${baseUrl}/settings?error=linkedin_callback_error&message=` + encodeURIComponent('Internal server error'));
  }
}