import { NextRequest, NextResponse } from 'next/server';
import { socialMediaService } from '@/services/social-media-service';

// POST /api/social-media/test-connection - Test API connection for a platform
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, accessToken, platformUserId } = body;

    if (!platform || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Platform and access token are required' },
        { status: 400 }
      );
    }

    // Create a temporary account object for testing
    const testAccount = {
      id: 'test',
      platform: platform.toUpperCase(),
      platformUserId: platformUserId || 'test',
      displayName: 'Test Account',
      accessToken,
      isActive: true,
    };

    // Test the connection using our real API services
    const connectionTest = await socialMediaService.testConnection(testAccount);
    
    if (connectionTest.success) {
      // Also test fetching analytics
      const analyticsTest = await socialMediaService.getAccountAnalytics(testAccount);
      
      return NextResponse.json({
        success: true,
        data: {
          connection: connectionTest,
          analytics: analyticsTest,
          platform: platform.toUpperCase()
        },
        message: 'Connection and analytics test successful'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: connectionTest.error,
        platform: platform.toUpperCase()
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Connection test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET /api/social-media/test-credentials - Test if API credentials are configured
export async function GET(request: NextRequest) {
  try {
    const platforms = ['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN'] as const;
    const credentialTests: Record<string, { valid: boolean; error?: string }> = {};

    for (const platform of platforms) {
      const validation = await socialMediaService.validateCredentials(platform);
      credentialTests[platform] = validation;
    }

    const allValid = Object.values(credentialTests).every((test: any) => test.valid);

    return NextResponse.json({
      success: true,
      data: {
        allConfigured: allValid,
        platforms: credentialTests
      },
      message: allValid 
        ? 'All API credentials are configured' 
        : 'Some API credentials are missing'
    });

  } catch (error) {
    console.error('Error testing credentials:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Credential test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}