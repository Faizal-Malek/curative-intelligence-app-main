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
    const body = await request.json();
    const { plan } = body;

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Update user plan
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan },
    });

    // TODO: Create activityLog after migration
    // Log the activity
    // await prisma.activityLog.create({
    //   data: {
    //     userId: adminUser.id,
    //     action: 'CHANGE_PLAN',
    //     description: `Changed ${updatedUser.email}'s plan to ${plan}`,
    //     metadata: { targetUserId: userId, newPlan: plan },
    //   },
    // });

    // TODO: Create notification after migration
    // Send notification to user
    // await prisma.notification.create({
    //   data: {
    //     userId: userId,
    //     type: 'SUCCESS',
    //     title: 'Plan Updated',
    //     message: `Your subscription plan has been changed to ${plan.charAt(0).toUpperCase() + plan.slice(1)}.`,
    //     createdBy: adminUser.id,
    //   },
    // });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error changing user plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
