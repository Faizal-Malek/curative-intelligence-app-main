import { getResend, getSenderConfig, generateOTPEmail, generateWelcomeEmail, generatePasswordResetEmail } from '@/lib/resend';
import { prisma } from '@/lib/prisma';

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds between sends
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15-minute rolling window
const MAX_SENDS_PER_WINDOW = 5;
const MAX_VERIFICATION_ATTEMPTS = 5;

type SendOtpResult = {
  success: boolean;
  error?: string;
  retryAfterSeconds?: number;
};

type VerifyOtpResult = {
  valid: boolean;
  expired?: boolean;
  locked?: boolean;
  attemptsRemaining?: number;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// OTP Service
export class OTPService {
  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(email: string, firstName?: string): Promise<SendOtpResult> {
    try {
      const resendClient = getResend();
      const { from } = getSenderConfig();

      const targetEmail = email.trim();
      const normalizedEmail = normalizeEmail(targetEmail);
      const now = new Date();
      const existing = await prisma.emailOtp.findUnique({ where: { email: normalizedEmail } });

      let windowStart = existing?.windowStart ?? now;
      let sendCount = existing?.sendCount ?? 0;

      if (existing) {
        const timeSinceWindowStart = now.getTime() - existing.windowStart.getTime();
        if (timeSinceWindowStart > RATE_LIMIT_WINDOW_MS) {
          // Reset the window if we are outside of the rate limit window
          sendCount = 0;
          windowStart = now;
        }

        const timeSinceLastSend = now.getTime() - existing.lastSentAt.getTime();
        if (timeSinceLastSend < RESEND_COOLDOWN_MS) {
          const retryAfterSeconds = Math.ceil((RESEND_COOLDOWN_MS - timeSinceLastSend) / 1000);
          return {
            success: false,
            error: `Please wait ${retryAfterSeconds}s before requesting a new code.`,
            retryAfterSeconds,
          };
        }
      }

      if (sendCount >= MAX_SENDS_PER_WINDOW) {
        const remainingMs = Math.max(0, RATE_LIMIT_WINDOW_MS - (now.getTime() - windowStart.getTime()));
        const retryAfterSeconds = Math.max(1, Math.ceil(remainingMs / 1000));

        return {
          success: false,
          error: 'Too many verification codes requested. Please try again later.',
          retryAfterSeconds,
        };
      }

      const otp = this.generateOTP();
      const expiresAt = new Date(now.getTime() + OTP_TTL_MS);

      await prisma.emailOtp.upsert({
        where: { email: normalizedEmail },
        create: {
          email: normalizedEmail,
          otp,
          expiresAt,
          attempts: 0,
          sendCount: 1,
          windowStart: now,
          lastSentAt: now,
        },
        update: {
          otp,
          expiresAt,
          attempts: 0,
          sendCount: sendCount + 1,
          windowStart,
          lastSentAt: now,
        },
      });

      const emailTemplate = generateOTPEmail(otp, firstName);

      await resendClient.emails.send({
        from,
        to: [email],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send OTP email' 
      };
    }
  }

  static async verifyOTP(email: string, providedOTP: string): Promise<VerifyOtpResult> {
    const normalizedEmail = normalizeEmail(email);
    const record = await prisma.emailOtp.findUnique({ where: { email: normalizedEmail } });

    if (!record) {
      return { valid: false };
    }

    const now = new Date();
    if (now > record.expiresAt) {
      await prisma.emailOtp.delete({ where: { email: normalizedEmail } });
      return { valid: false, expired: true };
    }

    if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      await prisma.emailOtp.delete({ where: { email: normalizedEmail } });
      return { valid: false, locked: true, attemptsRemaining: 0 };
    }

    if (record.otp !== providedOTP) {
      const attempts = record.attempts + 1;
      const attemptsRemaining = Math.max(0, MAX_VERIFICATION_ATTEMPTS - attempts);

      if (attempts >= MAX_VERIFICATION_ATTEMPTS) {
        await prisma.emailOtp.delete({ where: { email: normalizedEmail } });
        return { valid: false, locked: true, attemptsRemaining: 0 };
      }

      await prisma.emailOtp.update({
        where: { email: normalizedEmail },
        data: { attempts },
      });

      return { valid: false, attemptsRemaining };
    }

    await prisma.emailOtp.delete({ where: { email: normalizedEmail } });
    return { valid: true };
  }
}

// Welcome Email Service
export class WelcomeEmailService {
  static async sendWelcomeEmail(
    email: string, 
    firstName: string, 
    userType: 'brand' | 'influencer'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const emailTemplate = generateWelcomeEmail(firstName, userType);
      const resendClient = getResend();
      const { from } = getSenderConfig();

      await resendClient.emails.send({
        from,
        to: [email],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send welcome email' 
      };
    }
  }
}

// Password Reset Email Service
export class PasswordResetService {
  static async sendPasswordResetEmail(
    email: string, 
    resetToken: string, 
    firstName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;
      const emailTemplate = generatePasswordResetEmail(resetLink, firstName);
      const resendClient = getResend();
      const { from } = getSenderConfig();

      await resendClient.emails.send({
        from,
        to: [email],
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send password reset email' 
      };
    }
  }
}

// Notification Email Service
export class NotificationEmailService {
  static async sendCustomEmail({
    to,
    subject,
    html,
    text,
  }: {
    to: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const resendClient = getResend();
      const { from } = getSenderConfig();

      await resendClient.emails.send({
        from,
        to: [to],
        subject,
        html,
        text: text || subject,
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to send custom email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  static async sendBulkEmails(emails: Array<{
    to: string;
    subject: string;
    html: string;
    text?: string;
  }>): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const results: any[] = [];
    const errors: any[] = [];
    const resendClient = getResend();
    const { from } = getSenderConfig();

    for (const email of emails) {
      try {
        const result = await resendClient.emails.send({
          from,
          to: [email.to],
          subject: email.subject,
          html: email.html,
          text: email.text || email.subject,
        });
        results.push(result);
      } catch (error) {
        errors.push({ email: email.to, error });
      }
    }

    return { 
      success: errors.length === 0,
      results,
      errors 
    };
  }
}

