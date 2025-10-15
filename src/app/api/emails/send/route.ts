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
    const { NotificationEmailService } = await import('@/services/email');
    
    const body = await request.json();
    const { to, subject, html, text } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'to, subject, and html are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send custom email
    const result = await NotificationEmailService.sendCustomEmail({
      to,
      subject,
      html,
      text,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
    });

  } catch (error) {
    console.error('Send custom email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Bulk email endpoint
export async function PUT(request: NextRequest) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 503 }
      );
    }

    // Dynamic import to avoid build-time issues
    const { NotificationEmailService } = await import('@/services/email');
    
    const body = await request.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'emails array is required' },
        { status: 400 }
      );
    }

    // Validate each email in the array
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const email of emails) {
      if (!email.to || !email.subject || !email.html) {
        return NextResponse.json(
          { error: 'Each email must have to, subject, and html fields' },
          { status: 400 }
        );
      }
      if (!emailRegex.test(email.to)) {
        return NextResponse.json(
          { error: `Invalid email format: ${email.to}` },
          { status: 400 }
        );
      }
    }

    // Send bulk emails
    const result = await NotificationEmailService.sendBulkEmails(emails);

    return NextResponse.json({
      success: result.success,
      message: `Sent ${result.results.length} emails successfully`,
      results: result.results,
      errors: result.errors,
    });

  } catch (error) {
    console.error('Send bulk emails API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}