import { cache, CacheKeys, CacheTTL } from './cache';
import { prisma } from './prisma';

export type OwnerProfile = {
  id: string;
  clerkId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  role: string;
};

export async function getCachedOwnerProfile(clerkId: string) {
  const cacheKey = CacheKeys.userByClerkId(clerkId);
  const cached = cache.get<OwnerProfile>(cacheKey);
  if (cached) {
    return cached;
  }

  const owner = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      clerkId: true,
      firstName: true,
      lastName: true,
      email: true,
      imageUrl: true,
      role: true,
    },
  });

  if (owner) {
    cache.set(cacheKey, owner, CacheTTL.MEDIUM);
  }

  return owner;
}

export async function getUnreadNotificationCount(userId: string) {
  const cacheKey = CacheKeys.notifications(userId, true);
  const cached = cache.get<number>(cacheKey);
  if (typeof cached === 'number') {
    return cached;
  }

  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  cache.set(cacheKey, count, CacheTTL.SHORT);
  return count;
}
