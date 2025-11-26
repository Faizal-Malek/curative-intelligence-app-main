import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { getUserActivityLogs, getAllActivityLogs } from '@/services/notification-service';

/**
 * GET /api/activity-logs
 * Get activity logs (user's own logs or all logs for admin/owner)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: supabaseUser.id },
      select: { id: true, userType: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const all = searchParams.get('all') === 'true';

    // Owners and admins can see all activity logs
    const isAdmin = user.userType === 'business'; // TODO: Check actual role after migration
    
    if (all && isAdmin) {
      const result = await getAllActivityLogs(limit);
      return NextResponse.json({ logs: result.logs });
    }

    // Regular users see only their own logs
    const result = await getUserActivityLogs(user.id, limit);
    return NextResponse.json({ logs: result.logs });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}
