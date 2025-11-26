import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add role check after migration
    // Check if user is admin
    // const user = await prisma.user.findUnique({
    //   where: { clerkId: supabaseUser.id },
    //   select: { role: true },
    // });

    // if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
    //   return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    // }

    // Get dashboard statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // TODO: Add status queries after migration
    // TODO: Add supportTicket query after migration
    const [
      totalUsers,
      // activeUsers,
      // suspendedUsers,
      newUsersToday,
      // openTickets,
      socialMediaAccounts,
    ] = await Promise.all([
      prisma.user.count(),
      // prisma.user.count({ where: { status: 'ACTIVE' } }),
      // prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      // prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.socialMediaAccount.groupBy({
        by: ['platform'],
        _count: true,
      }),
    ]);

    // Placeholder values until migration
    const activeUsers = totalUsers;
    const suspendedUsers = 0;
    const openTickets = 0;

    // Find most used platform
    const mostUsedPlatform = socialMediaAccounts.length > 0
      ? socialMediaAccounts.reduce((prev, current) =>
          prev._count > current._count ? prev : current
        ).platform
      : 'Instagram';

    // Calculate average session time (mock for now)
    const avgSessionTime = '24m';

    // Calculate total revenue (mock for now)
    const proUsers = await prisma.user.count({ where: { plan: 'pro' } });
    const enterpriseUsers = await prisma.user.count({ where: { plan: 'enterprise' } });
    const totalRevenue = (proUsers * 29) + (enterpriseUsers * 99);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      suspendedUsers,
      newUsersToday,
      totalRevenue,
      openTickets,
      avgSessionTime,
      mostUsedPlatform,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
