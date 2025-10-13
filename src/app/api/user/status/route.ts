// File Path: src/app/api/user/status/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSupabaseUserFromCookies } from '@/lib/supabase'
import { ensureUserBySupabase } from '@/lib/user-supabase'

export async function GET(req: Request) {
  try {
  // Prefer SSR cookies; fall back to Authorization header during transition
  const su = await getSupabaseUserFromCookies()
    if (!su) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await ensureUserBySupabase(su.id, su.email ?? null)

    // If the user isn't in our DB yet (due to webhook delay),
    // we treat them as not onboarded.
    if (!user) {
      return NextResponse.json({ onboardingComplete: false });
    }

  return NextResponse.json({ onboardingComplete: user.onboardingComplete, userType: user.userType ?? null });

  } catch (error) {
    console.error('[API /user/status] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
