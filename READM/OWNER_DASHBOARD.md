# Owner Dashboard System

## Overview

The Owner Dashboard is a comprehensive admin control panel that gives you complete control over your platform. It includes user management, analytics, payment tracking, and navigation permissions.

## Features

### 1. **Owner Dashboard** (`/owner/dashboard`)
- **Platform Metrics**: Total users, active users, revenue, growth percentages
- **Overdue Payments Alert**: Red banner showing users with overdue payments
- **Recent Activity**: Real-time activity feed of platform actions
- **Payment Status**: Quick view of paid vs overdue users
- **Platform Activity**: Total posts, new users, active users
- **Quick Actions**: Direct links to user management, analytics, support

### 2. **User Management** (`/owner/users`)
Full control over all platform users:

#### Search & Filter
- Search by name or email
- Filter by user status (Active, Inactive, Suspended)
- Filter by payment status (Paid, Unpaid, Overdue)

#### User Actions
- **Change Plan**: Update user to Free, Basic, Pro, or Enterprise
- **Payment Management**:
  - Mark as Paid/Unpaid
  - Send payment reminders (creates notification + updates status)
  - Automatically sets next payment due date (30 days)
- **User Status Control**:
  - Suspend user (blocks platform access)
  - Activate user (restores access)
- **Navigation Permissions**:
  - Control what each user can see in their navbar
  - Remove/add: Dashboard, Calendar, Vault, Analytics, Profile, Pricing, Settings
  - Example: Hide Pricing from users on enterprise plan

### 3. **Owner Navigation Bar**
Professional dark admin navbar with:
- Dashboard, User Management, Analytics, Revenue
- Support Tickets, Reports, System Health, Settings
- Real-time notification bell with unread count
- Mobile responsive with hamburger menu

## Setup Instructions

### Step 1: Apply Database Migration
Run the SQL script to add owner-specific fields:

```bash
# Copy scripts/add-post-fields.sql to Supabase SQL Editor and run
```

### Step 2: Set Yourself as Owner
1. Open Supabase → SQL Editor
2. Copy `scripts/set-owner.sql`
3. Replace `YOUR_EMAIL@example.com` with your actual email
4. Run the script

### Step 3: Access Owner Dashboard
1. Sign in to your account
2. Navigate to `/owner/dashboard`
3. You'll see the admin portal with full platform access

## API Endpoints

### Dashboard Stats
`GET /api/owner/dashboard/stats`
- Returns platform metrics, user counts, revenue, growth percentages

### User Management
- `GET /api/owner/users` - Get all users with full details
- `GET /api/owner/users/overdue` - Get users with overdue payments
- `PATCH /api/owner/users/payment` - Update payment status
- `PATCH /api/owner/users/status` - Suspend/activate users
- `PATCH /api/owner/users/plan` - Change user plan
- `POST /api/owner/users/send-reminder` - Send payment reminder
- `PATCH /api/owner/users/navigation` - Update navigation permissions

### Activity Logs
`GET /api/owner/activity-logs?limit=10`
- Returns recent platform activity

## Role-Based Access

### Owner Role (`role: 'OWNER'`)
- Full platform access
- Can manage all users
- Can control navigation permissions
- Can view analytics and revenue
- Does NOT see pricing page (they don't pay)
- Uses separate OwnerNavbar instead of regular AppShell

### Admin Role (`role: 'ADMIN'`)
- Can manage users (but not change to OWNER)
- Can view analytics
- Does NOT see pricing page

### User Role (`role: 'USER'`)
- Standard platform access
- Navigation controlled by `allowedNavigation` field
- Can see pricing page (unless removed by owner)

## Navigation Permission System

### How It Works
Each user has an `allowedNavigation` JSON field:
```json
["dashboard", "calendar", "vault", "analytics", "profile", "pricing", "settings"]
```

### Owner Controls
1. Go to User Management
2. Click navigation settings icon (⚙️) for any user
3. Check/uncheck navigation items
4. Save changes

### Common Use Cases
- **Remove Pricing**: For enterprise users on custom contracts
- **Remove Analytics**: For users on free plan
- **Limit to Essentials**: Only dashboard + vault for basic users

## Payment Reminder System

### Automatic Detection
- Users with `paymentStatus: 'OVERDUE'`
- Users with `paymentStatus: 'UNPAID'` and `nextPaymentDue < now()`

### Manual Reminder
1. Go to User Management
2. Find user with overdue payment
3. Click mail icon (📧)
4. Creates notification with:
   - Plan name
   - Amount due
   - Due date
   - Link to /pricing

### Notification Template
```
⚠️ Payment Reminder: {plan} Plan - ${amount}
Your payment for the {plan} plan (${amount}) is overdue. 
Please update your payment method to continue using the platform.
Due date: {dueDate}
```

## Activity Logging

All owner actions are automatically logged:
- `UPDATE_PAYMENT_STATUS` - When marking users as paid/unpaid
- `SUSPEND_USER` - When suspending user access
- `ACTIVATE_USER` - When activating users
- `CHANGE_PLAN` - When updating user plans
- `SEND_PAYMENT_REMINDER` - When sending payment reminders
- `UPDATE_NAVIGATION` - When changing navigation permissions

View logs in:
- Owner Dashboard → Recent Activity
- Reports page (future)

## Design Philosophy

### Professional Admin Aesthetic
- Dark slate background with amber accents
- Clean card-based layouts
- Real-time metrics with growth indicators
- Color-coded badges (green=good, red=alert, orange=warning)

### User-Friendly Controls
- Inline controls (no modals for quick actions)
- Visual feedback (badges, colors, icons)
- Bulk operations support
- Mobile responsive throughout

## Future Enhancements

### Planned Features
- [ ] Analytics dashboard with charts (Recharts)
- [ ] Support ticket management system
- [ ] Revenue tracking with graphs
- [ ] System health monitoring
- [ ] Bulk user operations
- [ ] Export user data to CSV
- [ ] Email campaign system
- [ ] Platform announcement system

## Security Notes

- All owner endpoints check `role === 'OWNER'`
- Regular users cannot access owner routes
- Navigation permissions enforced at component level
- Activity logs track all admin actions
- Passwords/tokens never exposed in logs

## Troubleshooting

### Can't Access Owner Dashboard
1. Check your role: Run in Supabase SQL Editor:
   ```sql
   SELECT email, role FROM "User" WHERE email = 'your@email.com';
   ```
2. Should show `role: 'OWNER'`
3. If not, run `scripts/set-owner.sql`

### Navigation Not Updating
1. Clear browser cache
2. Sign out and sign back in
3. Check `allowedNavigation` in database

### Payment Reminders Not Sending
1. Check `Notification` table for entries
2. Verify user email is correct
3. Check activity logs for errors

## Support

For issues or questions:
1. Check browser console for errors
2. Check Supabase logs
3. Review activity logs in owner dashboard
