# Database Connection Troubleshooting Guide

## 🚨 Current Issue: "FATAL: Tenant or user not found"

This error indicates that the Supabase database credentials in your environment variables are incorrect or the project has been modified.

## 🔧 Step-by-Step Fix

### Step 1: Verify Your Supabase Project Status

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Log in with your account
   - Check if your project `lmktoaqnaamphgokztua` is still active

2. **Check Project Status**
   - If project shows as "Paused" → Resume it
   - If project doesn't exist → You'll need to create a new one
   - If project is active → Continue to Step 2

### Step 2: Get Fresh Database Credentials

1. **Navigate to Database Settings**
   - In your Supabase project dashboard
   - Go to: **Settings** → **Database**

2. **Copy the Connection String**
   - Find "Connection string" section
   - Select "URI" tab
   - Copy the full connection string
   - It should look like: `postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`

3. **Get Your Database Password**
   - The connection string will have `[YOUR-PASSWORD]` placeholder
   - Use the password you set when creating the project
   - If you forgot it, you can reset it in Settings → Database → Database password

### Step 3: Update Environment Variables

1. **Update `.env.local` file**
   ```bash
   # Replace with your actual credentials
   DATABASE_URL="postgresql://postgres.[your-ref]:[your-password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
   DIRECT_URL="postgresql://postgres.[your-ref]:[your-password]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   ```

2. **Important: URL Encode Special Characters**
   If your password contains special characters, encode them:
   - `{` becomes `%7B`
   - `}` becomes `%7D`
   - `@` becomes `%40`
   - `#` becomes `%23`

### Step 4: Test the Connection

```bash
# Run our connection test
node scripts/test-database-connection.js
```

### Step 5: Run Migration

Once connection is successful:
```bash
npx prisma db push
```

## 🆘 Alternative Solutions

### Option A: Manual SQL Migration

If Prisma continues to fail, you can run the migration manually:

1. **Go to Supabase SQL Editor**
   - In your Supabase dashboard
   - Go to: **SQL Editor**

2. **Run the Manual Migration**
   - Copy content from `scripts/manual-social-media-migration.sql`
   - Paste into SQL Editor
   - Click "Run"

### Option B: Create New Supabase Project

If your current project is corrupted:

1. **Create New Project**
   - Go to Supabase dashboard
   - Click "New project"
   - Choose a new name and password

2. **Update Environment Variables**
   - Get new connection string
   - Update `.env.local` with new credentials

3. **Run Migration**
   ```bash
   npx prisma db push
   ```

## 🔍 Common Issues and Solutions

### Issue: "Connection timeout"
**Solution**: Check if your IP is allowed in Supabase network restrictions

### Issue: "SSL connection required"
**Solution**: Add `?sslmode=require` to your DATABASE_URL

### Issue: "Database does not exist"
**Solution**: Make sure you're connecting to the 'postgres' database, not a custom one

### Issue: "Password authentication failed"
**Solution**: 
1. Reset your database password in Supabase dashboard
2. Update the connection string with new password
3. Make sure to URL-encode special characters

## ✅ Verification Steps

After fixing the connection:

1. **Test Basic Connection**
   ```bash
   node scripts/test-database-connection.js
   ```

2. **Verify Prisma Schema**
   ```bash
   npx prisma generate
   ```

3. **Run Migration**
   ```bash
   npx prisma db push
   ```

4. **Test Social Media Integration**
   ```bash
   node scripts/test-social-media-integration.js
   ```

## 📞 Need Help?

If you're still having issues:

1. **Check Supabase Status**: https://status.supabase.com/
2. **Supabase Discord**: https://discord.supabase.com/
3. **Documentation**: https://supabase.com/docs/guides/database

## 🔐 Security Reminders

- Never commit real database credentials to version control
- Use environment variables for all sensitive data
- Regularly rotate database passwords
- Use connection pooling for production applications

---

**Next**: Once database connection is working, we can proceed with testing the OAuth flows and implementing real API calls! 🚀