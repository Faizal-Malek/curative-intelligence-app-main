/**
 * Test script for Resend email functionality
 * Run with: node scripts/test-resend.js
 */

const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResendSetup() {
  console.log('🚀 Testing Resend Email Setup...\n');

  // Check if API key is set
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    console.log('💡 Add RESEND_API_KEY to your .env.local file\n');
    return;
  }

  // Check if from email is set
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  console.log(`📧 From Email: ${fromEmail}`);

  // Test email addresses (replace with your test email)
  const testEmail = process.env.TEST_EMAIL || 'test@example.com';
  
  if (testEmail === 'test@example.com') {
    console.log('⚠️  Please set TEST_EMAIL environment variable to your email address');
    console.log('   Example: TEST_EMAIL=your-email@example.com\n');
    return;
  }

  try {
    // Test 1: Send a simple test email
    console.log('📤 Sending test email...');
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: [testEmail],
      subject: 'Curative Intelligence - Resend Test Email',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Test Email</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2F2626; color: white; padding: 20px; text-align: center; }
              .content { background: #EFE8D8; padding: 30px; }
              .footer { background: #D2B193; padding: 15px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Resend Setup Successful!</h1>
              </div>
              <div class="content">
                <h2>Congratulations!</h2>
                <p>Your Resend email service is working correctly for Curative Intelligence.</p>
                <p><strong>Test Details:</strong></p>
                <ul>
                  <li>✅ API Key: Valid</li>
                  <li>✅ Email Delivery: Working</li>
                  <li>✅ HTML Templates: Rendering</li>
                  <li>✅ Brand Colors: Applied</li>
                </ul>
                <p>You can now use the email service for:</p>
                <ul>
                  <li>OTP verification</li>
                  <li>Welcome emails</li>
                  <li>Password reset emails</li>
                  <li>Custom notifications</li>
                </ul>
              </div>
              <div class="footer">
                <p>© 2025 Curative Intelligence | Powered by Resend</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        🎉 Resend Setup Successful!
        
        Congratulations! Your Resend email service is working correctly for Curative Intelligence.
        
        Test Details:
        ✅ API Key: Valid
        ✅ Email Delivery: Working
        ✅ HTML Templates: Rendering
        ✅ Brand Colors: Applied
        
        You can now use the email service for:
        - OTP verification
        - Welcome emails
        - Password reset emails
        - Custom notifications
        
        © 2025 Curative Intelligence | Powered by Resend
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📨 Email ID: ${result.data?.id}`);
    console.log(`📬 Check your inbox at: ${testEmail}\n`);

    // Test 2: Send OTP-style email
    console.log('📤 Sending OTP test email...');
    
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const otpResult = await resend.emails.send({
      from: fromEmail,
      to: [testEmail],
      subject: 'Your Curative Intelligence Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>OTP Verification</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
              .logo { font-size: 24px; font-weight: bold; color: #2F2626; }
              .content { padding: 30px 0; }
              .otp-code { background: #f8f9fa; border: 2px solid #D2B193; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
              .otp-number { font-size: 32px; font-weight: bold; color: #2F2626; letter-spacing: 4px; }
              .footer { border-top: 1px solid #eee; padding: 20px 0; text-align: center; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">Curative Intelligence</div>
              </div>
              
              <div class="content">
                <h2>Verification Code (Test)</h2>
                <p>This is a test OTP email. Your verification code is:</p>
                
                <div class="otp-code">
                  <div class="otp-number">${otpCode}</div>
                </div>
                
                <p>This is a test email. The code is for demonstration purposes only.</p>
              </div>
              
              <div class="footer">
                <p>© 2025 Curative Intelligence. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
        Your Curative Intelligence verification code is: ${otpCode}
        
        This is a test email. The code is for demonstration purposes only.
        
        © 2025 Curative Intelligence
      `
    });

    console.log('✅ OTP test email sent successfully!');
    console.log(`📨 Email ID: ${otpResult.data?.id}`);
    console.log(`🔢 Test OTP Code: ${otpCode}\n`);

    console.log('🎉 All tests passed! Your Resend setup is working correctly.');
    console.log('📚 Check RESEND_SETUP.md for detailed usage instructions.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('API key')) {
      console.log('💡 Check that your RESEND_API_KEY is correct and active');
    } else if (error.message.includes('domain')) {
      console.log('💡 Verify your domain is set up correctly in Resend dashboard');
    } else if (error.message.includes('from')) {
      console.log('💡 Check that your from email address is verified in Resend');
    }
    
    console.log('\n🔗 Resources:');
    console.log('   - Resend Dashboard: https://resend.com/dashboard');
    console.log('   - Domain Setup: https://resend.com/domains');
    console.log('   - API Keys: https://resend.com/api-keys');
  }
}

// Run the test
testResendSetup();