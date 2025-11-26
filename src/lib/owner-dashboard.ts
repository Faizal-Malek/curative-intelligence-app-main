import { prisma } from './prisma';
import { cache, CacheKeys, CacheTTL } from './cache';

export type OwnerStatsSnapshot = {
  totalUsers: number;
  activeUsers: number;
  paidUsers: number;
  unpaidUsers: number;
  overduePayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  openTickets: number;
  platformUptime: string;
  topPlatform: string;
  topPlatformPercentage: number;
  totalPosts: number;
  planBreakdown: {
    free: number;
    basic: number;
    pro: number;
    enterprise: number;
  };
};

export type OwnerActivityLog = {
  id: string;
  action: string;
  description: string | null;
  user: {
    name: string;
    email: string;
  };
  createdAt: Date;
};

export type OverdueUser = {
  id: string;
  name: string;
  email: string;
  nextPaymentDue: Date | null;
  daysOverdue: number;
};

export async function getOwnerStatsSnapshot(): Promise<OwnerStatsSnapshot> {
  const cacheKey = CacheKeys.ownerStats();
  const cached = cache.get<OwnerStatsSnapshot>(cacheKey);
  if (cached) {
    return cached;
  }

  const usersData = await prisma.user.groupBy({
    by: ['plan', 'paymentStatus'],
    where: {
      status: { not: 'DELETED' },
    },
    _count: true,
  });

  const openTickets = await prisma.supportTicket
    .count({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
      },
    })
    .catch(() => 0);

  const totalPosts = await prisma.post.count().catch(() => 0);

  const socialAccounts = await prisma.socialMediaAccount
    .groupBy({
      by: ['platform'],
      _count: true,
    })
    .catch(() => [] as Array<{ platform: string; _count: number }>);

  let totalUsers = 0;
  let paidUsers = 0;
  let unpaidUsers = 0;
  let overdueUsers = 0;
  let basicUsers = 0;
  let proUsers = 0;
  let enterpriseUsers = 0;

  usersData.forEach((group) => {
    const count = group._count;
    totalUsers += count;

    if (group.paymentStatus === 'PAID') paidUsers += count;
    if (group.paymentStatus === 'UNPAID') unpaidUsers += count;
    if (group.paymentStatus === 'OVERDUE') overdueUsers += count;

    if (group.plan === 'basic') basicUsers += count;
    if (group.plan === 'pro') proUsers += count;
    if (group.plan === 'enterprise') enterpriseUsers += count;
  });

  const activeUsers = await prisma.user
    .count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    })
    .catch(() => 0);

  const monthlyRevenue = basicUsers * 29 + proUsers * 79 + enterpriseUsers * 199;
  const totalRevenue = monthlyRevenue;

  const platformStats = socialAccounts.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.platform] = curr._count;
    return acc;
  }, {});

  const topPlatformEntry = Object.entries(platformStats).sort((a, b) => b[1] - a[1])[0];
  const topPlatform = topPlatformEntry ? topPlatformEntry[0] : 'Instagram';
  const topPlatformCount = topPlatformEntry ? topPlatformEntry[1] : 0;
  const topPlatformPercentage = totalUsers > 0 ? Math.round((topPlatformCount / totalUsers) * 100) : 0;

  const stats: OwnerStatsSnapshot = {
    totalUsers,
    activeUsers,
    paidUsers,
    unpaidUsers,
    overduePayments: overdueUsers,
    totalRevenue,
    monthlyRevenue,
    openTickets,
    platformUptime: '99.9%',
    topPlatform,
    topPlatformPercentage,
    totalPosts,
    planBreakdown: {
      free: totalUsers - basicUsers - proUsers - enterpriseUsers,
      basic: basicUsers,
      pro: proUsers,
      enterprise: enterpriseUsers,
    },
  };

  cache.set(cacheKey, stats, CacheTTL.SHORT);
  return stats;
}

export async function getOwnerActivityLogs(limit: number): Promise<OwnerActivityLog[]> {
  const cacheKey = CacheKeys.activityLogs(limit);
  const cached = cache.get<OwnerActivityLog[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const logs = await prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const formatted = logs.map((log) => ({
    id: log.id,
    action: log.action,
    description: log.description,
    user: {
      name: `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || 'Unknown User',
      email: log.user.email,
    },
    createdAt: log.createdAt,
  }));

  cache.set(cacheKey, formatted, CacheTTL.SHORT);
  return formatted;
}

export async function getOverdueUsersSnapshot(limit = 32): Promise<OverdueUser[]> {
  const cacheKey = CacheKeys.overdueUsers();
  const cached = cache.get<OverdueUser[]>(cacheKey);
  if (cached) {
    return limit ? cached.slice(0, limit) : cached;
  }

  const now = new Date();
  const overdueUsers = await prisma.user.findMany({
    where: {
      OR: [
        { paymentStatus: 'OVERDUE' },
        {
          AND: [
            { paymentStatus: 'UNPAID' },
            { nextPaymentDue: { lt: now } },
          ],
        },
      ],
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      nextPaymentDue: true,
    },
    orderBy: { nextPaymentDue: 'asc' },
    take: Math.max(limit, 32),
  });

  const usersWithOverdue: OverdueUser[] = overdueUsers.map((user) => {
    const dueDate = user.nextPaymentDue ? new Date(user.nextPaymentDue) : now;
    const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unnamed User',
      email: user.email,
      nextPaymentDue: user.nextPaymentDue,
      daysOverdue: Math.max(0, daysOverdue),
    };
  });

  cache.set(cacheKey, usersWithOverdue, CacheTTL.SHORT);
  return limit ? usersWithOverdue.slice(0, limit) : usersWithOverdue;
}
