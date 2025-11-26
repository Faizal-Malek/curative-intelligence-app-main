-- Set yourself as OWNER
-- Replace 'YOUR_EMAIL@example.com' with your actual email address

UPDATE "User" 
SET 
  "role" = 'OWNER',
  "status" = 'ACTIVE',
  "paymentStatus" = 'PAID',
  "allowedNavigation" = '["dashboard","calendar","vault","analytics","profile","pricing","settings","support"]'::jsonb
WHERE "email" = 'YOUR_EMAIL@example.com';

-- Verify the update
SELECT 
  "email", 
  "role", 
  "status", 
  "paymentStatus"
FROM "User" 
WHERE "email" = 'YOUR_EMAIL@example.com';

-- DONE! You are now the owner with full admin access
-- Navigate to /owner/dashboard to access the admin portal
