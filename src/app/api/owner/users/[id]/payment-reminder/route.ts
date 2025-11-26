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
    const ownerUser = await prisma.user.findUnique({
      where: { clerkId: supabaseUser.id },
      select: { id: true },
    });

    if (!ownerUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: userId } = params;

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, plan: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate amount based on plan
    const amount = targetUser.plan === 'pro' ? 29 : targetUser.plan === 'enterprise' ? 99 : 0;
    const dueDate = 'as soon as possible'; // TODO: Use nextPaymentDue after migration

    // TODO: Create notification after migration
    // await prisma.notification.create({
    //   data: {
    //     userId,
    //     type: 'WARNING',
    //     title: 'Payment Reminder',
    //     message: `Your ${targetUser.plan} plan subscription payment of $${amount} is due ${dueDate}. Please update your payment method to continue enjoying uninterrupted service.`,
    //     createdBy: ownerUser.id,
    //   },
    // });

    // TODO: Log activity after migration
    // await prisma.activityLog.create({
    //   data: {
    //     userId: ownerUser.id,
    //     action: 'SEND_PAYMENT_REMINDER',
    //     description: `Sent payment reminder to ${targetUser.email}`,
    //     metadata: { targetUserId: userId, amount, plan: targetUser.plan },
    //   },
    // });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment reminder sent (mock - will be functional after migration)' 
    });
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
