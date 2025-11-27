import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { ensureUserBySupabase, extractProfileFromSupabaseUser } from '@/lib/user-supabase';
import { prisma } from '@/lib/prisma';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import { buildNavigationConfig } from '@/lib/navigation';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try cache first
    const cacheKey = CacheKeys.userProfile(supabaseUser.id);
    const cached = cache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ user: cached });
    }

    // Ensure user exists in database
    const ensured = await ensureUserBySupabase(
      supabaseUser.id,
      supabaseUser.email ?? null,
      extractProfileFromSupabaseUser(supabaseUser)
    );

    if (!ensured) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch full profile with editable fields
    const user = await prisma.user.findUnique({
      where: { id: ensured.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        plan: true,
        userType: true,
        role: true,
        status: true,
        allowedNavigation: true,
        onboardingComplete: true,
        createdAt: true,
        company: true,
        location: true,
        bio: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const navigation = buildNavigationConfig(user.allowedNavigation);

    const userProfile = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      plan: user.plan,
      userType: user.userType,
      role: user.role,
      status: user.status,
      allowedNavigation: navigation.allowed,
      navigation,
      onboardingComplete: user.onboardingComplete,
      createdAt: user.createdAt,
      company: user.company,
      location: user.location,
      bio: user.bio,
      phone: user.phone,
    };

    // Cache for 1 minute
    cache.set(cacheKey, userProfile, CacheTTL.MEDIUM);

    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get existing user from database
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: supabaseUser.id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body = await request.json();
    const { firstName, lastName, phone, company, location, bio, imageUrl } = body;

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        firstName: firstName ?? existingUser.firstName,
        lastName: lastName ?? existingUser.lastName,
        imageUrl: imageUrl ?? existingUser.imageUrl,
        phone: phone ?? existingUser.phone,
        company: company ?? existingUser.company,
        location: location ?? existingUser.location,
        bio: bio ?? existingUser.bio,
      },
    });

    // Invalidate cache
    cache.delete(CacheKeys.userProfile(supabaseUser.id));
    cache.delete(CacheKeys.user(existingUser.id));

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        imageUrl: updatedUser.imageUrl,
        phone: updatedUser.phone,
        company: updatedUser.company,
        location: updatedUser.location,
        bio: updatedUser.bio,
        plan: updatedUser.plan,
        userType: updatedUser.userType,
        role: updatedUser.role,
        status: updatedUser.status,
        onboardingComplete: updatedUser.onboardingComplete,
        createdAt: updatedUser.createdAt,
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
