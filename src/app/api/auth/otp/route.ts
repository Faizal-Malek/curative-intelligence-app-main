import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 503 }
      );
    }

    // Dynamic import to avoid build-time issues
    const { OTPService } = await import('@/services/email');
    
    const body = await request.json();
    const { email, firstName } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Send OTP
    const result = await OTPService.sendOTP(email, firstName);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Failed to send OTP',
          retryAfterSeconds: result.retryAfterSeconds,
        },
        { status: result.retryAfterSeconds ? 429 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
    });

  } catch (error) {
    console.error('Send OTP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { OTPService } = await import('@/services/email');
    
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const verification = await OTPService.verifyOTP(email, otp);

    if (!verification.valid) {
      const errorMessage = verification.expired
        ? 'OTP has expired'
        : verification.locked
        ? 'Too many incorrect attempts. Please request a new verification code.'
        : 'Invalid OTP';

      return NextResponse.json(
        {
          error: errorMessage,
          expired: verification.expired ?? false,
          locked: verification.locked ?? false,
          attemptsRemaining: verification.attemptsRemaining,
        },
        { status: verification.locked ? 423 : 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
    });

  } catch (error) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}