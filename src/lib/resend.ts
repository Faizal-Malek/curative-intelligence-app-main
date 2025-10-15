import { Resend } from 'resend';

// Lazy initialization of Resend to avoid build-time errors
let _resend: Resend | null = null;

export const getResend = (): Resend => {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not defined in environment variables');
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
};

// Email templates and configurations
export const emailConfig = {
  from: process.env.RESEND_FROM_EMAIL || 'onboarding@yourdomain.com',
  // You'll need to replace this with your verified domain from Resend
  domain: process.env.RESEND_DOMAIN || 'yourdomain.com',
};

// OTP Email Template
export const generateOTPEmail = (otp: string, firstName?: string) => ({
  subject: 'Your Curative Intelligence Verification Code',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
          .logo { font-size: 24px; font-weight: bold; color: #2F2626; }
          .content { padding: 30px 0; }
          .otp-code { background: #f8f9fa; border: 2px solid #D2B193; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp-number { font-size: 32px; font-weight: bold; color: #2F2626; letter-spacing: 4px; }
          .footer { border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px; }
          .button { background: #2F2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Curative Intelligence</div>
          </div>
          
          <div class="content">
            <h2>Verification Code</h2>
            ${firstName ? `<p>Hi ${firstName},</p>` : '<p>Hello,</p>'}
            
            <p>Your verification code for Curative Intelligence is:</p>
            
            <div class="otp-code">
              <div class="otp-number">${otp}</div>
            </div>
            
            <p>This code will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
            
            <p>For security reasons, never share this code with anyone.</p>
          </div>
          
          <div class="footer">
            <p>© 2025 Curative Intelligence. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
    </html>
  `,
  text: `
    Your Curative Intelligence verification code is: ${otp}
    
    This code will expire in 10 minutes.
    
    If you didn't request this code, please ignore this email.
    
    © 2025 Curative Intelligence
  `
});

// Welcome Email Template
export const generateWelcomeEmail = (firstName: string, userType: 'brand' | 'influencer') => ({
  subject: 'Welcome to Curative Intelligence!',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Curative Intelligence</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; background: linear-gradient(135deg, #2F2626 0%, #D2B193 100%); color: white; border-radius: 8px 8px 0 0; }
          .logo { font-size: 28px; font-weight: bold; }
          .content { padding: 30px; background: #EFE8D8; }
          .footer { background: #2F2626; color: white; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .button { background: #D2B193; color: #2F2626; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
          .feature-list { list-style: none; padding: 0; }
          .feature-list li { padding: 8px 0; }
          .feature-list li:before { content: "✓"; color: #D2B193; font-weight: bold; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Welcome to Curative Intelligence</div>
          </div>
          
          <div class="content">
            <h2>Hi ${firstName}! 👋</h2>
            
            <p>Welcome to Curative Intelligence! We're excited to have you join our community of ${userType === 'brand' ? 'innovative brands' : 'creative influencers'}.</p>
            
            <h3>What's Next?</h3>
            <ul class="feature-list">
              <li>Complete your profile setup</li>
              <li>${userType === 'brand' ? 'Configure your brand voice and preferences' : 'Set up your content creation preferences'}</li>
              <li>Start generating ${userType === 'brand' ? 'engaging content for your brand' : 'authentic content for your audience'}</li>
              <li>Explore our AI-powered tools and features</li>
            </ul>
            
            <p>Ready to get started?</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding" class="button">Complete Your Setup</a>
            
            <p>If you have any questions, our support team is here to help!</p>
          </div>
          
          <div class="footer">
            <p>© 2025 Curative Intelligence. All rights reserved.</p>
            <p>Need help? Contact us at support@curativeintelligence.com</p>
          </div>
        </div>
      </body>
    </html>
  `,
  text: `
    Welcome to Curative Intelligence, ${firstName}!
    
    We're excited to have you join our community of ${userType === 'brand' ? 'innovative brands' : 'creative influencers'}.
    
    What's Next:
    - Complete your profile setup
    - ${userType === 'brand' ? 'Configure your brand voice and preferences' : 'Set up your content creation preferences'}
    - Start generating ${userType === 'brand' ? 'engaging content for your brand' : 'authentic content for your audience'}
    - Explore our AI-powered tools and features
    
    Get started: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding
    
    © 2025 Curative Intelligence
    Need help? Contact us at support@curativeintelligence.com
  `
});

// Password Reset Email Template
export const generatePasswordResetEmail = (resetLink: string, firstName?: string) => ({
  subject: 'Reset Your Curative Intelligence Password',
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
          .logo { font-size: 24px; font-weight: bold; color: #2F2626; }
          .content { padding: 30px 0; }
          .footer { border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px; }
          .button { background: #2F2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Curative Intelligence</div>
          </div>
          
          <div class="content">
            <h2>Reset Your Password</h2>
            ${firstName ? `<p>Hi ${firstName},</p>` : '<p>Hello,</p>'}
            
            <p>We received a request to reset your password for your Curative Intelligence account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetLink}</p>
            
            <div class="warning">
              <strong>Security Notice:</strong>
              <ul>
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2025 Curative Intelligence. All rights reserved.</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
    </html>
  `,
  text: `
    Reset Your Curative Intelligence Password
    
    ${firstName ? `Hi ${firstName},` : 'Hello,'}
    
    We received a request to reset your password for your Curative Intelligence account.
    
    Reset your password: ${resetLink}
    
    Security Notice:
    - This link will expire in 1 hour
    - If you didn't request this reset, please ignore this email
    - Your password will remain unchanged
    
    © 2025 Curative Intelligence
  `
});