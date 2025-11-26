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
    // const user = await prisma.user.findUnique({
    //   where: { clerkId: supabaseUser.id },
    //   select: { role: true },
    // });
    // if (!user || user.role !== 'OWNER') {
    //   return NextResponse.json({ error: 'Forbidden - Owner access required' }, { status: 403 });
    // }

    // Fetch data for analytics
    const [users, posts, socialAccounts] = await Promise.all([
      prisma.user.findMany({
        select: { 
          createdAt: true, 
          plan: true,
          // loginCount: true,
          // lastLoginAt: true,
        },
      }),
      prisma.post.count(),
      prisma.socialMediaAccount.groupBy({
        by: ['platform'],
        _count: true,
      }),
    ]);

    // Calculate user growth (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userGrowth = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(Date.now() - i * 4 * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const usersUpToDate = users.filter(u => new Date(u.createdAt) <= date).length;
      userGrowth.unshift({ date: dateStr, users: usersUpToDate });
    }

    // Calculate platform distribution
    const totalConnections = socialAccounts.reduce((sum, p) => sum + p._count, 0);
    const platformDistribution = socialAccounts.map(p => ({
      platform: p.platform,
      users: p._count,
      percentage: totalConnections > 0 ? Math.round((p._count / totalConnections) * 100) : 0,
    }));

    // Calculate plan distribution
    const planCounts = users.reduce((acc, u) => {
      acc[u.plan] = (acc[u.plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const planDistribution = Object.entries(planCounts).map(([plan, count]) => ({
      plan,
      count,
      percentage: Math.round((count / users.length) * 100),
    }));

    // Calculate revenue growth (last 6 months)
    const revenueGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      
      const proUsers = users.filter(u => u.plan === 'pro').length;
      const enterpriseUsers = users.filter(u => u.plan === 'enterprise').length;
      const revenue = (proUsers * 29) + (enterpriseUsers * 99);
      
      revenueGrowth.push({ month, revenue });
    }

    // Calculate activity metrics
    // TODO: Add after migration
    const activeUsers = Math.floor(users.length * 0.6); // Placeholder: 60% of users
    const totalLogins = users.length * 10; // Placeholder
    const avgPostsPerUser = users.length > 0 ? posts / users.length : 0;

    return NextResponse.json({
      userGrowth,
      revenueGrowth,
      platformDistribution,
      planDistribution,
      activityMetrics: {
        totalPosts: posts,
        avgPostsPerUser,
        activeUsers,
        totalLogins,
      },
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
