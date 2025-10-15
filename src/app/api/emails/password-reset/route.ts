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
    const { PasswordResetService } = await import('@/services/email');
    
    const body = await request.json();
    const { email, resetToken, firstName } = body;

    if (!email || !resetToken) {
      return NextResponse.json(
        { error: 'Email and resetToken are required' },
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

    // Send password reset email
    const result = await PasswordResetService.sendPasswordResetEmail(email, resetToken, firstName);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
    });

  } catch (error) {
    console.error('Send password reset email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}