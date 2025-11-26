-- =====================================================
-- ADMIN NOTIFICATION API - Usage Guide
-- Send notifications to users via API
-- =====================================================

-- STEP 1: Set ADMIN_API_KEY in your .env file
-- Add this to your .env:
-- ADMIN_API_KEY=your-secure-random-key-here

-- STEP 2: Send notifications using cURL or Postman
-- Replace YOUR_ADMIN_KEY with the actual key from .env

-- Example 1: Payment Request Notification
curl -X POST https://your-domain.com/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "type": "ADMIN_MESSAGE",
    "title": "Payment Request",
    "message": "Your monthly subscription payment of $49 is due. Please update your payment method.",
    "actionUrl": "/pricing",
    "adminKey": "YOUR_ADMIN_KEY"
  }'

-- Example 2: System Announcement
curl -X POST https://your-domain.com/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "type": "ANNOUNCEMENT",
    "title": "New Features Available",
    "message": "We just launched AI-powered content scheduling! Check it out in your calendar.",
    "actionUrl": "/calendar",
    "adminKey": "YOUR_ADMIN_KEY"
  }'

-- Example 3: Warning Notification
curl -X POST https://your-domain.com/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "type": "WARNING",
    "title": "Account Limit Reached",
    "message": "You have reached 90% of your monthly post generation limit. Consider upgrading your plan.",
    "actionUrl": "/pricing",
    "adminKey": "YOUR_ADMIN_KEY"
  }'

-- Example 4: Success Notification
curl -X POST https://your-domain.com/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-uuid-here",
    "type": "SUCCESS",
    "title": "Payment Received",
    "message": "Thank you! Your payment of $49 has been processed successfully.",
    "adminKey": "YOUR_ADMIN_KEY"
  }'

-- NOTIFICATION TYPES:
-- - SYSTEM: General system messages (default)
-- - ADMIN_MESSAGE: Direct messages from admin (blue icon)
-- - ANNOUNCEMENT: Important announcements (purple icon)
-- - WARNING: Warnings and alerts (yellow icon)
-- - SUCCESS: Success confirmations (green icon)

-- REQUIRED FIELDS:
-- - userId: User UUID from database
-- - title: Short notification title
-- - message: Notification message body
-- - adminKey: Admin API key for authorization

-- OPTIONAL FIELDS:
-- - type: Notification type (defaults to SYSTEM)
-- - actionUrl: URL to redirect when clicked (e.g., /pricing, /support)

-- =====================================================
-- TO GET USER IDs:
-- Run this query in Supabase SQL Editor
-- =====================================================

SELECT 
  id as "userId",
  email,
  "firstName",
  "lastName",
  plan,
  "paymentStatus"
FROM "User"
ORDER BY "createdAt" DESC;

-- =====================================================
-- BULK NOTIFICATIONS (Node.js script example)
-- =====================================================

/*
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const API_URL = "https://your-domain.com/api/notifications";

async function sendBulkNotifications(userIds, notification) {
  for (const userId of userIds) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          ...notification,
          adminKey: ADMIN_API_KEY,
        }),
      });
      
      if (response.ok) {
        console.log(`✅ Sent to ${userId}`);
      } else {
        console.error(`❌ Failed for ${userId}:`, await response.text());
      }
    } catch (error) {
      console.error(`❌ Error for ${userId}:`, error);
    }
  }
}

// Send payment reminder to all unpaid users
const unpaidUserIds = ["user-id-1", "user-id-2", "user-id-3"];
sendBulkNotifications(unpaidUserIds, {
  type: "ADMIN_MESSAGE",
  title: "Payment Reminder",
  message: "Your subscription payment is overdue. Please update your payment method to continue using premium features.",
  actionUrl: "/pricing",
});
*/

-- =====================================================
-- DONE! ✅
-- =====================================================
