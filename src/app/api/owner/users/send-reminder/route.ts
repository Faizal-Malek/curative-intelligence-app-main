import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { createNotification, logActivity, NotificationTemplates } from '@/services/notification-service';

export async function POST(request: NextRequest) {
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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate amount based on plan
    const planPrices: Record<string, number> = {
      free: 0,
      basic: 29,
      pro: 79,
      enterprise: 199,
    };
    const amount = planPrices[targetUser.plan] || 29;

    // Create payment reminder notification
    const dueDate = 'ASAP';

    const notification = NotificationTemplates.paymentReminder(
      targetUser.plan,
      amount,
      dueDate
    );

    await createNotification({
      userId: targetUser.id,
      ...notification,
      createdBy: owner.id,
      actionUrl: '/pricing',
    });

    // Update payment status to overdue if not already
    if (targetUser.paymentStatus !== 'OVERDUE') {
      await prisma.user.update({
        where: { id: userId },
        data: { paymentStatus: 'OVERDUE' },
      });
    }

    // Log activity
    await logActivity({
      userId: owner.id,
      action: 'SEND_PAYMENT_REMINDER',
      description: `Sent payment reminder to ${targetUser.email} (${targetUser.plan} - $${amount})`,
      metadata: { 
        targetUserId: userId, 
        plan: targetUser.plan,
        amount,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment reminder sent successfully' 
    });
  } catch (error) {
    console.error('Error sending payment reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send payment reminder' },
      { status: 500 }
    );
  }
}
