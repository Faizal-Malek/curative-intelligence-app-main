import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/services/notification-service';

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner
    const owner = await prisma.user.findUnique({
      where: { clerkId: supabaseUser.id },
    });

    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, allowedNavigation } = body;

    if (!userId || !Array.isArray(allowedNavigation)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate navigation items
    const validNavigationItems = [
      'dashboard',
      'calendar',
      'vault',
      'analytics',
      'profile',
      'pricing',
      'settings',
      'support',
    ];

    const invalidItems = allowedNavigation.filter(
      (item) => !validNavigationItems.includes(item)
    );

    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: `Invalid navigation items: ${invalidItems.join(', ')}` },
        { status: 400 }
      );
    }

    // Update user navigation permissions
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { allowedNavigation },
    });

    // Log activity
    await logActivity({
      userId: owner.id,
      action: 'UPDATE_NAVIGATION',
      description: `Updated navigation permissions for ${updatedUser.email}`,
      metadata: { 
        targetUserId: userId, 
        allowedNavigation,
        removed: validNavigationItems.filter(item => !allowedNavigation.includes(item)),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating navigation:', error);
    return NextResponse.json(
      { error: 'Failed to update navigation' },
      { status: 500 }
    );
  }
}
