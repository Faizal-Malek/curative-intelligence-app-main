import { NextRequest, NextResponse } from 'next/server';
import { WelcomeEmailService } from '@/services/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, userType } = body;

    if (!email || !firstName || !userType) {
      return NextResponse.json(
        { error: 'Email, firstName, and userType are required' },
        { status: 400 }
      );
    }

    if (!['brand', 'influencer'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid userType. Must be "brand" or "influencer"' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send welcome email
    const result = await WelcomeEmailService.sendWelcomeEmail(email, firstName, userType);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send welcome email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully',
    });

  } catch (error) {
    console.error('Send welcome email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}