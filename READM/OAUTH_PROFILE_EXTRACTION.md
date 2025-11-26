# OAuth Profile Auto-Population

## Overview

When users sign up or sign in with Google OAuth, we automatically extract and populate their profile information to reduce manual setup work.

## What We Extract from Google

### During Sign-Up/Sign-In (`/api/auth/callback`)

When a user authenticates via Google OAuth, we extract:

1. **First Name**
   - From: `user_metadata.full_name` or `user_metadata.name`
   - Stored in: `User.firstName`

2. **Last Name**
   - From: `user_metadata.full_name` or `user_metadata.name`
   - Stored in: `User.lastName`

3. **Profile Picture**
   - From: `user_metadata.avatar_url` or `user_metadata.picture`
   - Stored in: `User.imageUrl`

4. **Email Address**
   - From: `user.email`
   - Stored in: `User.email` (required, unique)

5. **Phone Number** (if provided)
   - From: `user_metadata.phone` or `user.phone`
   - Stored in: `User.phone`

## How It Works

### 1. OAuth Callback Flow

```typescript
// src/app/api/auth/callback/route.ts

// Google OAuth redirects here after user grants permission
// We extract ALL available profile data
const profile = {
  firstName: nameParts[0] ?? null,
  lastName: nameParts.slice(1).join(' ') || null,
  imageUrl: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
  phone: user.user_metadata?.phone ?? user.phone ?? null,
}

// Create/update user with profile data
await ensureUserBySupabase(user.id, user.email, profile)
```

### 2. Smart Profile Updates

The `ensureUserBySupabase` function intelligently handles profile data:

#### For New Users
- All available profile fields are populated immediately
- User doesn't need to enter name, profile picture, etc.

#### For Existing Users
- Only updates fields that are **currently empty**
- Never overwrites existing user-edited data
- Example:
  ```typescript
  // Only update if field is empty AND we have new data
  if (!foundByEmail.firstName && profile?.firstName) {
    updateData.firstName = profile.firstName
  }
  ```

### 3. Login Tracking

Every sign-in also updates:
- `lastLoginAt` - Timestamp of last login
- `loginCount` - Incremented on each login

## Google OAuth Permissions

### What We Request

When users sign up with Google, we request access to:

1. **Basic Profile** (always granted):
   - Name (first + last)
   - Email address
   - Profile picture

2. **Optional** (if user grants):
   - Phone number

### What Users See

Google shows a consent screen like:
```
Google will allow [your-app] to access this info about you:
- Faizal Malek (Name and profile picture)
- faizalmalek667@gmail.com (Email address)
```

## Configuration

### Supabase OAuth Setup

1. **Enable Google Provider**:
   - Supabase Dashboard → Authentication → Providers
   - Enable Google
   - Add OAuth Client ID and Secret from Google Cloud Console

2. **Redirect URL**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

3. **Google Cloud Console**:
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URIs
   - Request scopes: `email`, `profile`

## User Experience

### First-Time Sign-Up

1. User clicks "Sign in with Google"
2. Google consent screen appears
3. User grants permission
4. **Automatic profile population**:
   - ✅ First Name: "Faizal"
   - ✅ Last Name: "Malek"
   - ✅ Email: "faizalmalek667@gmail.com"
   - ✅ Profile Picture: Google avatar
5. User proceeds to onboarding with pre-filled profile

### Returning User

1. User clicks "Sign in with Google"
2. Instant sign-in (no consent screen)
3. Profile data remains intact
4. Login tracking updated

## Benefits

### For Users
- **Less work**: No need to manually enter name, upload profile picture
- **Faster onboarding**: Skip basic profile setup
- **Always current**: Profile picture syncs from Google (if they change it)

### For Platform
- **Higher completion rates**: Pre-filled forms reduce abandonment
- **Better data quality**: Google-verified names and emails
- **Professional appearance**: Users have profile pictures from day 1

## Privacy & Security

### What We DON'T Store
- Google OAuth tokens (handled by Supabase)
- Google account passwords
- Access to Gmail, Drive, or other Google services

### What Users Control
- Can change name/picture anytime in profile settings
- Can revoke OAuth access in Google account settings
- Profile updates never overwrite their manual changes

## Debugging

### Check What We Received

When a user signs up, check the server logs:
```
[auth/callback] Google OAuth profile data: {
  email: 'faizalmalek667@gmail.com',
  firstName: 'Faizal',
  lastName: 'Malek',
  hasImage: true,
  hasPhone: false
}
```

### Verify in Database

```sql
SELECT 
  email, 
  "firstName", 
  "lastName", 
  "imageUrl", 
  phone 
FROM "User" 
WHERE email = 'user@example.com';
```

## Future Enhancements

### Potential Additional Data
- **Locale/Language**: `user_metadata.locale`
- **Timezone**: Inferred from browser
- **Company**: For business accounts (if Google Workspace)

### Additional OAuth Providers
- **Facebook**: Name, email, profile picture
- **LinkedIn**: Professional profile data
- **GitHub**: Username, avatar, bio
- **Twitter/X**: Handle, avatar, bio

## Common Issues

### Profile Picture Not Showing
- Check `User.imageUrl` in database
- Verify Google avatar URL is accessible
- Some corporate Google accounts restrict avatar access

### Name Not Extracted
- Some Google accounts don't share full name
- User can manually enter in profile settings
- Check `user_metadata` in Supabase auth.users table

### Phone Number Missing
- Google rarely shares phone numbers
- User needs to manually add if needed
- Not required for platform functionality

## Code References

**Auth Callback**:
- `src/app/api/auth/callback/route.ts` - OAuth profile extraction

**User Creation**:
- `src/lib/user-supabase.ts` - `ensureUserBySupabase()` function

**Profile Display**:
- `src/app/(app)/profile/page.tsx` - Profile page
- `src/components/layout/AppShell.tsx` - User menu
- `src/components/layout/OwnerNavbar.tsx` - Owner dashboard
