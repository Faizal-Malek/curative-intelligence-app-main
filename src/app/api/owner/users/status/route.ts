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
    const { userId, status } = body;

    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    // Log activity
    await logActivity({
      userId: owner.id,
      action: status === 'SUSPENDED' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
      description: `Changed user status for ${updatedUser.email} to ${status}`,
      metadata: { targetUserId: userId, status },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
