import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function POST(
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
    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: supabaseUser.id },
      select: { id: true },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }
    // if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'OWNER')) {
    //   return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    // }

    const userId = params.id;

    // Get user for response
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Update status after migration
    // Activate the user
    // const updatedUser = await prisma.user.update({
    //   where: { id: userId },
    //   data: { status: 'ACTIVE' },
    // });

    // TODO: Create activityLog after migration
    // Log the activity
    // await prisma.activityLog.create({
    //   data: {
    //     userId: adminUser.id,
    //     action: 'ACTIVATE_USER',
    //     description: `Activated user ${user.email}`,
    //     metadata: { targetUserId: userId },
    //   },
    // });

    // TODO: Create notification after migration
    // Send notification to activated user
    // await prisma.notification.create({
    //   data: {
    //     userId: userId,
    //     type: 'SUCCESS',
    //     title: 'Account Activated',
    //     message: 'Your account has been activated. You can now access all features.',
    //     createdBy: adminUser.id,
    //   },
    // });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error activating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
