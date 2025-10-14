// File Path: src/app/api/user/status/route.ts

import { NextResponse } from 'next/server';
import { getSupabaseUserFromCookies } from '@/lib/supabase';
import { ensureUserBySupabase } from '@/lib/user-supabase';

type StatusResponse = {
  onboardingComplete: boolean;
  userType: 'business' | 'influencer' | null;
};

const DEFAULT_STATUS: StatusResponse = {
  onboardingComplete: false,
  userType: null,
};

export async function GET() {
  try {
    const supabaseUser = await getSupabaseUserFromCookies();

    if (!supabaseUser) {
      return NextResponse.json(DEFAULT_STATUS);
    }

    try {
      const user = await ensureUserBySupabase(supabaseUser.id, supabaseUser.email ?? null);

      if (!user) {
        return NextResponse.json(DEFAULT_STATUS);
      }

      const userType =
        user.userType === 'business' || user.userType === 'influencer'
          ? user.userType
          : null;

      return NextResponse.json({
        onboardingComplete: Boolean(user.onboardingComplete),
        userType,
      });
    } catch (innerError) {
      console.error('[API /user/status] Failed to resolve user:', innerError);
      return NextResponse.json(DEFAULT_STATUS);
    }
  } catch (error) {
    console.error('[API /user/status] Error:', error);
    return NextResponse.json(DEFAULT_STATUS);
  }
}
