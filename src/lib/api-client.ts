/**
 * Advanced data fetching utilities with caching, retries, and optimizations
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Cache configuration
interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
  enabled?: boolean;
}

// Request configuration
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: CacheConfig;
  retry?: {
    attempts: number;
    delay: number;
    backoff?: boolean;
  };
  timeout?: number;
  signal?: AbortSignal;
}

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Response interface
interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

// Global cache store
class CacheStore {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
const globalCache = new CacheStore();

// Generate cache key
function generateCacheKey(url: string, config?: RequestConfig): string {
  const method = config?.method || 'GET';
  const body = config?.body ? JSON.stringify(config.body) : '';
  return `${method}:${url}:${body}`;
}

// Sleep utility for retry delays
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced fetch with retry logic
async function fetchWithRetry<T>(
  url: string,
  config: RequestConfig = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    retry = { attempts: 3, delay: 1000, backoff: true },
    timeout = 10000,
    signal,
  } = config;

  let lastError: Error;

  for (let attempt = 0; attempt < retry.attempts; attempt++) {
    try {
      // Create timeout signal if not provided
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const finalSignal = signal || controller.signal;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: finalSignal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Don't retry on client errors (4xx)
      if (error instanceof Error && error.message.includes('4')) {
        throw error;
      }

      // Don't retry if it's the last attempt
      if (attempt === retry.attempts - 1) {
        break;
      }

      // Calculate delay with optional backoff
      const delay = retry.backoff 
        ? retry.delay * Math.pow(2, attempt)
        : retry.delay;
      
      await sleep(delay);
    }
  }

  throw lastError!;
}

// Main data fetching hook
export function useApi<T>(
  url: string | null,
  config: RequestConfig = {}
): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const configRef = useRef(config);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update config ref when config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Fetch function
  const fetchData = useCallback(async () => {
    if (!url) return;

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentConfig = configRef.current;
    const cacheConfig = currentConfig.cache || {};
    
    // Check cache first
    if (cacheConfig.enabled !== false && currentConfig.method === 'GET') {
      const cacheKey = generateCacheKey(url, currentConfig);
      const cachedData = globalCache.get<T>(cacheKey);
      
      if (cachedData) {
        setData(cachedData);
        setError(null);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Create new abort controller for this request
      const controller = new AbortController();
      abortControllerRef.current = controller;

      const result = await fetchWithRetry<T>(url, {
        ...currentConfig,
        signal: controller.signal,
      });

      // Cache successful GET requests
      if (cacheConfig.enabled !== false && currentConfig.method === 'GET') {
        const cacheKey = generateCacheKey(url, currentConfig);
        const ttl = cacheConfig.ttl || 5 * 60 * 1000; // 5 minutes default
        globalCache.set(cacheKey, result, ttl);
      }

      setData(result);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was aborted, don't update state
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [url]);

  // Mutate function for optimistic updates
  const mutate = useCallback((newData: T) => {
    setData(newData);
    
    // Update cache if applicable
    const currentConfig = configRef.current;
    const cacheConfig = currentConfig.cache || {};
    
    if (url && cacheConfig.enabled !== false) {
      const cacheKey = generateCacheKey(url, currentConfig);
      const ttl = cacheConfig.ttl || 5 * 60 * 1000;
      globalCache.set(cacheKey, newData, ttl);
    }
  }, [url]);

  // Initial fetch
  useEffect(() => {
    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
}

// Mutation hook for POST/PUT/DELETE operations
export function useMutation<TData, TVariables = any>(
  url: string,
  config: RequestConfig = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (variables?: TVariables): Promise<TData | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchWithRetry<TData>(url, {
        ...config,
        body: variables,
      });

      // Invalidate related cache entries
      if (config.method !== 'GET') {
        globalCache.invalidatePattern(url.split('?')[0]);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url, config]);

  return {
    mutate,
    loading,
    error,
  };
}

// Paginated data hook
export function usePaginatedApi<T>(
  baseUrl: string,
  config: RequestConfig & { pageSize?: number } = {}
) {
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  
  const pageSize = config.pageSize || 20;
  const url = `${baseUrl}?page=${page}&limit=${pageSize}`;
  
  const { data, loading, error, refetch } = useApi<{
    data: T[];
    pagination: {
      total: number;
      totalPages: number;
      hasNext: boolean;
    };
  }>(url, config);

  useEffect(() => {
    if (data) {
      if (page === 1) {
        setAllData(data.data);
      } else {
        setAllData(prev => [...prev, ...data.data]);
      }
      setHasMore(data.pagination.hasNext);
    }
  }, [data, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
  }, []);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    refetch,
  };
}

// Infinite scroll hook
export function useInfiniteScroll(
  loadMore: () => void,
  hasMore: boolean,
  threshold = 100
) {
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.offsetHeight - threshold
      ) {
        if (hasMore) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore, hasMore, threshold]);
}

// Cache utilities
export const cacheUtils = {
  invalidate: (key: string) => globalCache.invalidate(key),
  invalidatePattern: (pattern: string) => globalCache.invalidatePattern(pattern),
  clear: () => globalCache.clear(),
  size: () => globalCache.size(),
};

// Pre-configured hooks for common endpoints
export function useDashboardStats() {
  return useApi('/api/dashboard/stats', {
    cache: { ttl: 2 * 60 * 1000 }, // 2 minutes
    retry: { attempts: 2, delay: 1000 },
  });
}

export function useSocialMediaAnalytics() {
  return useApi('/api/social-media/analytics', {
    cache: { ttl: 5 * 60 * 1000 }, // 5 minutes
    retry: { attempts: 3, delay: 1000, backoff: true },
  });
}

export function useSocialMediaAccounts() {
  return useApi('/api/social-media/accounts', {
    cache: { ttl: 10 * 60 * 1000 }, // 10 minutes
  });
}

export function useCalendarEvents(date?: string) {
  const url = date ? `/api/calendar/events?date=${date}` : '/api/calendar/events';
  return useApi(url, {
    cache: { ttl: 1 * 60 * 1000 }, // 1 minute
  });
}