import { getResend, emailConfig, generateOTPEmail, generateWelcomeEmail, generatePasswordResetEmail } from '@/lib/resend';

// OTP Service
export class OTPService {
  private static otpStore = new Map<string, { otp: string; expiry: number; email: string }>();

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendOTP(email: string, firstName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const otp = this.generateOTP();
      const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store OTP with email for verification
      this.otpStore.set(email, { otp, expiry, email });

      const emailTemplate = generateOTPEmail(otp, firstName);

      const result = await getResend().emails.send({
        from: emailConfig.from,
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

  static verifyOTP(email: string, providedOTP: string): { valid: boolean; expired?: boolean } {
    const stored = this.otpStore.get(email);
    
    if (!stored) {
      return { valid: false };
    }

    if (Date.now() > stored.expiry) {
      this.otpStore.delete(email);
      return { valid: false, expired: true };
    }

    const isValid = stored.otp === providedOTP;
    
    if (isValid) {
      this.otpStore.delete(email); // Remove OTP after successful verification
    }

    return { valid: isValid };
  }

  static clearExpiredOTPs(): void {
    const now = Date.now();
    for (const [email, data] of this.otpStore.entries()) {
      if (now > data.expiry) {
        this.otpStore.delete(email);
      }
    }
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

      const result = await getResend().emails.send({
        from: emailConfig.from,
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

      const result = await getResend().emails.send({
        from: emailConfig.from,
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
      const result = await getResend().emails.send({
        from: emailConfig.from,
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

    for (const email of emails) {
      try {
        const result = await getResend().emails.send({
          from: emailConfig.from,
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

// Clean up expired OTPs every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    OTPService.clearExpiredOTPs();
  }, 5 * 60 * 1000);
}