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
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate plan
    const validPlans = ['free', 'basic', 'pro', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Update user plan
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan },
    });

    // Log activity
    await logActivity({
      userId: owner.id,
      action: 'CHANGE_PLAN',
      description: `Changed plan for ${updatedUser.email} to ${plan}`,
      metadata: { targetUserId: userId, plan },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}
