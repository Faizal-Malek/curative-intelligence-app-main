/**
 * Simple in-memory cache for frequently accessed data
 * Production: Replace with Redis or similar
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttlMs: number = 60000): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Invalidate all keys matching a pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cache = new MemoryCache(1000);

// Cache key builders
export const CacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userByClerkId: (clerkId: string) => `user:clerk:${clerkId}`,
  userStatus: (userId: string) => `user:status:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  ownerStats: () => `owner:stats`,
  activityLogs: (limit: number) => `activity:logs:${limit}`,
  overdueUsers: () => `owner:overdue`,
  notifications: (userId: string, unread: boolean) => `notifications:${userId}:${unread}`,
};

// TTL constants (in milliseconds)
export const CacheTTL = {
  SHORT: 30 * 1000, // 30 seconds
  MEDIUM: 60 * 1000, // 1 minute
  LONG: 5 * 60 * 1000, // 5 minutes
  VERY_LONG: 15 * 60 * 1000, // 15 minutes
};

// Helper to invalidate user-related caches
export function invalidateUserCache(userId: string) {
  cache.delete(CacheKeys.user(userId));
  cache.delete(CacheKeys.userStatus(userId));
  cache.delete(CacheKeys.userProfile(userId));
  cache.invalidatePattern(`notifications:${userId}`);
}

// Helper to invalidate owner dashboard caches
export function invalidateOwnerCache() {
  cache.delete(CacheKeys.ownerStats());
  cache.delete(CacheKeys.overdueUsers());
  cache.invalidatePattern(`activity:logs:`);
}
