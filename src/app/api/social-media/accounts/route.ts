import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUserFromCookies } from '@/lib/supabase';
import { ensureUserBySupabase, extractProfileFromSupabaseUser } from '@/lib/user-supabase';
import { getUserSocialAccounts } from '@/lib/social-tokens';

export async function GET() {
  try {
    // Get current authenticated user
    const su = await getSupabaseUserFromCookies();
    if (!su) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await ensureUserBySupabase(
      su.id,
      su.email ?? null,
      extractProfileFromSupabaseUser(su)
    );
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get user's connected social media accounts
    const connectedAccounts = await getUserSocialAccounts(user.id);
    
    // Create a comprehensive list including all platforms
    const allPlatforms = ['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN'];
    
    const accounts = allPlatforms.map(platform => {
      const connected = connectedAccounts.find(acc => acc.platform === platform);
      
      return {
        id: connected?.id || platform.toLowerCase(),
        platform: platform.toLowerCase(),
        username: connected?.username || null,
        displayName: connected?.displayName || null,
        isConnected: !!connected,
        followerCount: connected?.followerCount || null,
        lastSync: connected?.lastSync || null,
        profileImage: connected?.profileImage || null,
        tokenExpired: connected?.tokenExpiresAt ? new Date(connected.tokenExpiresAt) < new Date() : false
      };
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching social media accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { platform, action } = await request.json();

    if (action === 'connect') {
      // Return the OAuth URL for the platform
      return NextResponse.json({ 
        success: true, 
        message: `${platform} connection initiated`,
        authUrl: `/api/auth/${platform}`
      });
    } else if (action === 'disconnect') {
      // TODO: Implement actual disconnect logic when user auth is ready
      // This would revoke tokens and mark account as inactive in database
      return NextResponse.json({ 
        success: true, 
        message: `${platform} disconnected successfully`
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error managing social media account:', error);
    return NextResponse.json(
      { error: 'Failed to manage social media account' },
      { status: 500 }
    );
  }
}