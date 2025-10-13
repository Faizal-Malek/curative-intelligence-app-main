/**
 * Rate limiting utilities for API protection
 */

import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for development (use Redis for production)
const store: RateLimitStore = {};

export interface RateLimitConfig {
  request: NextRequest;
  limit: number;
  window: number; // in milliseconds
  keyGenerator?: (req: NextRequest) => string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
}

/**
 * Default key generator using IP address
 */
function defaultKeyGenerator(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 
            request.headers.get('x-real-ip') || 
            request.headers.get('cf-connecting-ip') || // Cloudflare
            request.headers.get('x-client-ip') ||
            'unknown';
  
  return `rate_limit:${ip}`;
}

/**
 * Rate limiting implementation
 */
export async function rateLimit({
  request,
  limit,
  window,
  keyGenerator = defaultKeyGenerator,
}: RateLimitConfig): Promise<RateLimitResult> {
  const key = keyGenerator(request);
  const now = Date.now();
  
  // Clean up expired entries
  cleanupExpiredEntries(now);
  
  // Get or create rate limit entry
  let entry = store[key];
  
  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    entry = {
      count: 0,
      resetTime: now + window,
    };
    store[key] = entry;
  }
  
  // Increment counter
  entry.count++;
  
  const remaining = Math.max(0, limit - entry.count);
  const success = entry.count <= limit;
  
  return {
    success,
    limit,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(now: number): void {
  // Only clean up periodically to avoid performance impact
  if (Math.random() > 0.1) return;
  
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

/**
 * Rate limit middleware for specific endpoints
 */
export function createRateLimit(limit: number, windowMs: number) {
  return async (request: NextRequest): Promise<RateLimitResult> => {
    return rateLimit({
      request,
      limit,
      window: windowMs,
    });
  };
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  // Strict limit for auth endpoints
  auth: createRateLimit(5, 15 * 60 * 1000), // 5 requests per 15 minutes
  
  // Standard limit for API endpoints
  api: createRateLimit(100, 60 * 1000), // 100 requests per minute
  
  // Generous limit for read operations
  read: createRateLimit(1000, 60 * 1000), // 1000 requests per minute
  
  // Strict limit for write operations
  write: createRateLimit(50, 60 * 1000), // 50 requests per minute
  
  // Very strict limit for expensive operations
  expensive: createRateLimit(10, 60 * 1000), // 10 requests per minute
  
  // OAuth callback endpoints
  oauth: createRateLimit(20, 60 * 1000), // 20 requests per minute
};

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  };
}

/**
 * Rate limit by user ID
 */
export function createUserRateLimit(limit: number, windowMs: number) {
  return async (request: NextRequest, userId: string): Promise<RateLimitResult> => {
    return rateLimit({
      request,
      limit,
      window: windowMs,
      keyGenerator: () => `user_rate_limit:${userId}`,
    });
  };
}

/**
 * Rate limit by API key
 */
export function createApiKeyRateLimit(limit: number, windowMs: number) {
  return async (request: NextRequest, apiKey: string): Promise<RateLimitResult> => {
    return rateLimit({
      request,
      limit,
      window: windowMs,
      keyGenerator: () => `api_key_rate_limit:${apiKey}`,
    });
  };
}

/**
 * Check if IP is in whitelist
 */
export function isWhitelisted(request: NextRequest): boolean {
  const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
  if (whitelist.length === 0) return false;
  
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || 
            request.headers.get('x-real-ip') || 
            request.headers.get('cf-connecting-ip') || // Cloudflare
            request.headers.get('x-client-ip') ||
            'unknown';
  
  return whitelist.includes(ip);
}

/**
 * Advanced rate limiting with multiple rules
 */
export async function advancedRateLimit(
  request: NextRequest,
  rules: Array<{
    limit: number;
    window: number;
    keyGenerator?: (req: NextRequest) => string;
  }>
): Promise<RateLimitResult[]> {
  const results = await Promise.all(
    rules.map(rule => rateLimit({
      request,
      limit: rule.limit,
      window: rule.window,
      keyGenerator: rule.keyGenerator,
    }))
  );
  
  return results;
}

/**
 * Check if all rate limit rules pass
 */
export function allRateLimitsPass(results: RateLimitResult[]): boolean {
  return results.every(result => result.success);
}

/**
 * Reset rate limit for a specific key (admin function)
 */
export function resetRateLimit(key: string): void {
  delete store[key];
}

/**
 * Get current rate limit status for a key
 */
export function getRateLimitStatus(key: string): {
  count: number;
  remaining: number;
  resetTime: number;
} | null {
  const entry = store[key];
  if (!entry) return null;
  
  const now = Date.now();
  if (now > entry.resetTime) return null;
  
  return {
    count: entry.count,
    remaining: Math.max(0, 100 - entry.count), // Default limit for status check
    resetTime: entry.resetTime,
  };
}