# Email Service Implementation with Resend

This document outlines how to set up and use Resend for sending emails in your Curative Intelligence application.

## 🚀 Setup Instructions

### 1. Get Your Resend API Key

1. Visit [Resend](https://resend.com) and create an account
2. Go to your dashboard and create a new API key
3. Copy the API key (starts with `re_`)

### 2. Set Up Your Domain

#### Option A: Use Resend's Shared Domain (Quick Setup)
- You can start immediately using `onboarding@resend.dev`
- Good for development and testing

#### Option B: Use Your Own Domain (Recommended for Production)
1. Go to [Resend Domains](https://resend.com/domains)
2. Add your domain (e.g., `yourdomain.com`)
3. Add the required DNS records to your domain provider:
   - MX Record
   - TXT Record for SPF
   - DKIM Records
4. Wait for verification (usually takes a few minutes)

### 3. Environment Variables

Add these to your `.env.local` file:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com  # or onboarding@resend.dev for testing
RESEND_DOMAIN=yourdomain.com              # or resend.dev for testing
NEXT_PUBLIC_APP_URL=http://localhost:3000 # Update for production
```

## 📧 Available Email Services

### 1. OTP (One-Time Password) Service

Send and verify OTP codes for email verification:

```typescript
import { useEmail } from '@/hooks/useEmail';

const { sendOTP, verifyOTP, isLoading, error } = useEmail();

// Send OTP
const result = await sendOTP('user@example.com', 'John');

// Verify OTP
const verification = await verifyOTP('user@example.com', '123456');
```

### 2. Welcome Email Service

Send branded welcome emails to new users:

```typescript
import { useEmail } from '@/hooks/useEmail';

const { sendWelcomeEmail } = useEmail();

const result = await sendWelcomeEmail(
  'user@example.com',
  'John Doe',
  'brand' // or 'influencer'
);
```

### 3. Password Reset Service

Send password reset links:

```typescript
import { useEmail } from '@/hooks/useEmail';

const { sendPasswordResetEmail } = useEmail();

const result = await sendPasswordResetEmail(
  'user@example.com',
  'reset_token_here',
  'John'
);
```

### 4. Custom Email Service

Send custom branded emails:

```typescript
import { useEmail } from '@/hooks/useEmail';

const { sendCustomEmail } = useEmail();

const result = await sendCustomEmail(
  'user@example.com',
  'Your Custom Subject',
  '<h1>Custom HTML Content</h1>',
  'Custom text content'
);
```

## 🔌 API Endpoints

### OTP Endpoints

**Send OTP:**
```
POST /api/auth/otp
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John" // optional
}
```

**Verify OTP:**
```
PUT /api/auth/otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Email Endpoints

**Welcome Email:**
```
POST /api/emails/welcome
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "userType": "brand" // or "influencer"
}
```

**Password Reset Email:**
```
POST /api/emails/password-reset
Content-Type: application/json

{
  "email": "user@example.com",
  "resetToken": "your_reset_token",
  "firstName": "John" // optional
}
```

**Custom Email:**
```
POST /api/emails/send
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Your Subject",
  "html": "<h1>HTML Content</h1>",
  "text": "Text content" // optional
}
```

**Bulk Emails:**
```
PUT /api/emails/send
Content-Type: application/json

{
  "emails": [
    {
      "to": "user1@example.com",
      "subject": "Subject 1",
      "html": "<h1>Content 1</h1>"
    },
    {
      "to": "user2@example.com",
      "subject": "Subject 2",
      "html": "<h1>Content 2</h1>"
    }
  ]
}
```

## 🎨 Using the OTP Component

Include the pre-built OTP verification component in your authentication flow:

```tsx
import { OTPVerification } from '@/components/auth/OTPVerification';

function AuthPage() {
  const handleVerified = () => {
    console.log('Email verified successfully!');
    // Redirect or continue with authentication
  };

  return (
    <OTPVerification
      email="user@example.com"
      firstName="John"
      onVerified={handleVerified}
      onCancel={() => console.log('Cancelled')}
    />
  );
}
```

## 🎯 Integration Examples

### 1. Onboarding Flow

```typescript
// After user completes onboarding
import { WelcomeEmailService } from '@/services/email';

const result = await WelcomeEmailService.sendWelcomeEmail(
  user.email,
  user.firstName,
  user.userType
);

if (result.success) {
  console.log('Welcome email sent!');
}
```

### 2. Authentication Flow

```typescript
// In your sign-up component
import { OTPService } from '@/services/email';

// Step 1: Send OTP
const otpResult = await OTPService.sendOTP(email, firstName);

// Step 2: Verify OTP
const verifyResult = OTPService.verifyOTP(email, userProvidedOTP);

if (verifyResult.valid) {
  // Email verified, continue with registration
}
```

### 3. Password Reset Flow

```typescript
// Generate reset token and send email
import { PasswordResetService } from '@/services/email';

const resetToken = generateSecureToken(); // Your token generation logic
const result = await PasswordResetService.sendPasswordResetEmail(
  email,
  resetToken,
  firstName
);
```

## 📊 Monitoring and Analytics

### View Email Statistics

Log into your Resend dashboard to view:
- Delivery rates
- Open rates
- Click rates
- Bounce rates
- Spam complaints

### Error Handling

All email services return standardized responses:

```typescript
interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  expired?: boolean; // For OTP verification
}
```

## 🔧 Customization

### Email Templates

Email templates are defined in `/src/lib/resend.ts`. You can customize:
- HTML styling
- Brand colors (using your existing theme: #2F2626, #D2B193, #EFE8D8)
- Content structure
- Logo and branding

### Rate Limiting

Consider implementing rate limiting for OTP sending to prevent abuse:

```typescript
// Example rate limiting logic
const rateLimitKey = `otp_${email}`;
const attempts = await redis.get(rateLimitKey);

if (attempts && parseInt(attempts) >= 3) {
  return { success: false, error: 'Too many attempts. Try again later.' };
}
```

## 🚀 Production Deployment

### 1. Update Environment Variables

Update your production environment with:
- Production RESEND_API_KEY
- Your verified domain email address
- Production NEXT_PUBLIC_APP_URL

### 2. Vercel Environment Variables

If deploying to Vercel, add environment variables in your Vercel dashboard:
- RESEND_API_KEY
- RESEND_FROM_EMAIL
- RESEND_DOMAIN
- NEXT_PUBLIC_APP_URL

### 3. Domain Verification

Ensure your domain is verified in Resend before going live.

## 📝 Best Practices

1. **Use your own domain** for production (builds trust)
2. **Implement rate limiting** to prevent abuse
3. **Monitor email delivery** regularly
4. **Keep templates mobile-friendly**
5. **Include unsubscribe links** for marketing emails
6. **Test emails** in multiple email clients
7. **Use clear, action-oriented subject lines**

## 🆘 Troubleshooting

### Common Issues

1. **API Key Error:** Ensure RESEND_API_KEY is correctly set
2. **Domain Not Verified:** Check DNS records in your domain provider
3. **Emails Not Delivered:** Check spam folder, verify email addresses
4. **Rate Limiting:** Implement proper rate limiting and retry logic

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=resend:*
```

This will log all Resend API interactions for troubleshooting.

## 📚 Resources

- [Resend Documentation](https://resend.com/docs)
- [Resend Dashboard](https://resend.com/dashboard)
- [Domain Setup Guide](https://resend.com/docs/send-with-nextjs)
- [Email Best Practices](https://resend.com/docs/best-practices)