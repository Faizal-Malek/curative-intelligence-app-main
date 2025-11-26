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
    const { userId, paymentStatus } = body;

    if (!userId || !paymentStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update payment status
    const updateData: any = { paymentStatus };

    // If marking as paid, update payment dates
    if (paymentStatus === 'PAID') {
      const now = new Date();
      const nextPaymentDue = new Date(now);
      nextPaymentDue.setMonth(nextPaymentDue.getMonth() + 1); // Next payment in 1 month

      updateData.lastPaymentDate = now;
      updateData.nextPaymentDue = nextPaymentDue;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Log activity
    await logActivity({
      userId: owner.id,
      action: 'UPDATE_PAYMENT_STATUS',
      description: `Updated payment status for ${updatedUser.email} to ${paymentStatus}`,
      metadata: { targetUserId: userId, paymentStatus },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Failed to update payment status' },
      { status: 500 }
    );
  }
}
