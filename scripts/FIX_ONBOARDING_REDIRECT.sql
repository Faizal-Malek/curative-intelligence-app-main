-- =====================================================
-- QUICK FIX: Set onboardingComplete to true for existing users
-- Run this in Supabase SQL Editor immediately to fix login redirect loop
-- =====================================================

-- Set all existing users to onboardingComplete = true
-- (They were able to sign up, so they completed any required onboarding)
UPDATE "User" 
SET "onboardingComplete" = true 
WHERE "onboardingComplete" = false OR "onboardingComplete" IS NULL;

-- Verify the update
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE "onboardingComplete" = true) as completed_onboarding,
    COUNT(*) FILTER (WHERE "onboardingComplete" = false) as pending_onboarding
FROM "User";

-- =====================================================
-- DONE! ✅
-- All users now have onboardingComplete = true
-- =====================================================
