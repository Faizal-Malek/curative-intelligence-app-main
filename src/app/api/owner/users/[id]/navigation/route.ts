import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add role check after migration
    const ownerUser = await prisma.user.findUnique({
      where: { clerkId: supabaseUser.id },
      select: { id: true },
    });

    if (!ownerUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { allowedNavigation } = await request.json();
    const { id: userId } = params;

    // TODO: Update allowed navigation after migration
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Log activity after migration
    // await prisma.activityLog.create({
    //   data: {
    //     userId: ownerUser.id,
    //     action: 'UPDATE_NAVIGATION',
    //     description: `Updated navigation permissions for user ${updatedUser.email}`,
    //     metadata: { 
    //       targetUserId: userId, 
    //       allowedNavigation,
    //     },
    //   },
    // });

    // TODO: Notify user of changes after migration
    // await prisma.notification.create({
    //   data: {
    //     userId,
    //     type: 'SYSTEM',
    //     title: 'Account Settings Updated',
    //     message: 'Your account navigation permissions have been updated by an administrator.',
    //     createdBy: ownerUser.id,
    //   },
    // });

    return NextResponse.json({ 
      success: true, 
      message: 'Navigation permissions updated (mock - will be functional after migration)',
      user: { ...updatedUser, allowedNavigation } 
    });
  } catch (error) {
    console.error('Error updating navigation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
