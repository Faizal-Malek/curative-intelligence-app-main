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

    const { paymentStatus } = await request.json();
    const { id: userId } = params;

    // TODO: Update payment status after migration
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
    //     action: 'UPDATE_PAYMENT_STATUS',
    //     description: `Updated payment status for user ${updatedUser.email} to ${paymentStatus}`,
    //     metadata: { targetUserId: userId, newStatus: paymentStatus },
    //   },
    // });

    return NextResponse.json({ 
      success: true, 
      message: 'Payment status updated (mock - will be functional after migration)',
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
