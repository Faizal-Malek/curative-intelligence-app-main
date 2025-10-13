/**
 * API Middleware utilities for production-ready API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUserFromCookies } from './supabase';
import { ensureUserBySupabase } from './user-supabase';
import { createError, createErrorResponse, logError } from './error-handler';
import { z, ZodSchema } from 'zod';
import { rateLimit } from './rate-limiter';

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  supabaseId: string;
}

export interface ApiContext {
  user?: AuthenticatedUser;
  params?: Record<string, string | string[] | undefined>;
  searchParams?: URLSearchParams;
  body?: any;
}

export type ApiHandler<T = any> = (
  request: NextRequest,
  context: ApiContext
) => Promise<NextResponse | T>;

export interface ApiMiddlewareOptions {
  requireAuth?: boolean;
  validateBody?: ZodSchema;
  validateParams?: ZodSchema;
  validateQuery?: ZodSchema;
  rateLimitConfig?: {
    maxRequests: number;
    windowMs: number;
    keyGenerator?: (req: NextRequest) => string;
  };
  permissions?: string[];
  logRequest?: boolean;
}

/**
 * Main API middleware wrapper with comprehensive error handling
 */
export function withApiMiddleware(
  handler: ApiHandler,
  options: ApiMiddlewareOptions = {}
) {
  return async (
    request: NextRequest,
    routeContext?: {
      params?: Promise<Record<string, string | string[] | undefined>>;
    }
  ): Promise<NextResponse> => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    
    try {
      // Initialize context
      const rawParams = routeContext?.params
        ? await routeContext.params
        : undefined;

      const context: ApiContext = {
        params: rawParams,
        searchParams: new URL(request.url).searchParams,
      };

      // Log request if enabled
      if (options.logRequest !== false) {
        console.log(`[${requestId}] ${request.method} ${request.url}`, {
          userAgent: request.headers.get('user-agent'),
          timestamp: new Date().toISOString(),
        });
      }

      // Rate limiting
      if (options.rateLimitConfig) {
        const rateLimitResult = await rateLimit({
          request,
          limit: options.rateLimitConfig.maxRequests,
          window: options.rateLimitConfig.windowMs,
          keyGenerator: options.rateLimitConfig.keyGenerator,
        });

        if (!rateLimitResult.success) {
          throw createError.rateLimit('Too many requests', {
            limit: options.rateLimitConfig.maxRequests,
            resetTime: rateLimitResult.resetTime,
          });
        }
      }

      // Authentication
      if (options.requireAuth !== false) {
        const supabaseUser = await getSupabaseUserFromCookies();
        if (!supabaseUser) {
          throw createError.unauthorized('Authentication required');
        }

        const user = await ensureUserBySupabase(
          supabaseUser.id,
          supabaseUser.email ?? null
        );
        
        if (!user) {
          throw createError.unauthorized('User not found in database');
        }

        context.user = {
          id: user.id,
          email: user.email,
          supabaseId: supabaseUser.id,
        };
      }

      // Body validation
      if (options.validateBody && request.method !== 'GET') {
        try {
          const body = await request.json();
          context.body = options.validateBody.parse(body);
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw createError.validation('Invalid request body', {
              validationErrors: error.issues,
            });
          }
          throw createError.badRequest('Invalid JSON in request body');
        }
      }

      // Params validation
      if (options.validateParams && context.params) {
        try {
          context.params = options.validateParams.parse(context.params);
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw createError.validation('Invalid URL parameters', {
              validationErrors: error.issues,
            });
          }
          throw error;
        }
      }

      // Query validation
      if (options.validateQuery) {
        try {
          const queryObject = Object.fromEntries(context.searchParams?.entries() || []);
          options.validateQuery.parse(queryObject);
        } catch (error) {
          if (error instanceof z.ZodError) {
            throw createError.validation('Invalid query parameters', {
              validationErrors: error.issues,
            });
          }
          throw error;
        }
      }

      // Execute handler
      const result = await handler(request, context);
      
      // Log successful request
      const duration = Date.now() - startTime;
      console.log(`[${requestId}] Success ${request.method} ${request.url}`, {
        duration: `${duration}ms`,
        statusCode: result instanceof NextResponse ? result.status : 200,
      });

      // Return result or convert to NextResponse
      return result instanceof NextResponse 
        ? result 
        : NextResponse.json(result);

    } catch (error) {
      // Log error with request context
      const duration = Date.now() - startTime;
      logError(error, {
        requestId,
        method: request.method,
        url: request.url,
        duration: `${duration}ms`,
        userAgent: request.headers.get('user-agent'),
      });

      return createErrorResponse(error);
    }
  };
}

/**
 * Wrapper for GET endpoints
 */
export function withGet(
  handler: ApiHandler,
  options: Omit<ApiMiddlewareOptions, 'validateBody'> = {}
) {
  return withApiMiddleware(handler, { ...options, validateBody: undefined });
}

/**
 * Wrapper for POST endpoints
 */
export function withPost(
  handler: ApiHandler,
  options: ApiMiddlewareOptions = {}
) {
  return withApiMiddleware(handler, options);
}

/**
 * Wrapper for PUT endpoints
 */
export function withPut(
  handler: ApiHandler,
  options: ApiMiddlewareOptions = {}
) {
  return withApiMiddleware(handler, options);
}

/**
 * Wrapper for DELETE endpoints
 */
export function withDelete(
  handler: ApiHandler,
  options: Omit<ApiMiddlewareOptions, 'validateBody'> = {}
) {
  return withApiMiddleware(handler, { ...options, validateBody: undefined });
}

/**
 * Wrapper for PATCH endpoints
 */
export function withPatch(
  handler: ApiHandler,
  options: ApiMiddlewareOptions = {}
) {
  return withApiMiddleware(handler, options);
}

/**
 * Public endpoint wrapper (no auth required)
 */
export function withPublic(
  handler: ApiHandler,
  options: Omit<ApiMiddlewareOptions, 'requireAuth'> = {}
) {
  return withApiMiddleware(handler, { ...options, requireAuth: false });
}

/**
 * Admin-only endpoint wrapper
 */
export function withAdmin(
  handler: ApiHandler,
  options: ApiMiddlewareOptions = {}
) {
  return withApiMiddleware(async (request, context) => {
    // Additional admin check could be added here
    if (!context.user) {
      throw createError.unauthorized('Admin access required');
    }
    
    return handler(request, context);
  }, { ...options, requireAuth: true });
}

/**
 * Utility to validate request method
 */
export function validateMethod(request: NextRequest, allowedMethods: string[]) {
  if (!allowedMethods.includes(request.method)) {
    throw createError.badRequest(
      `Method ${request.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      { allowedMethods, receivedMethod: request.method }
    );
  }
}

/**
 * Utility to extract pagination parameters
 */
export function extractPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

/**
 * Utility to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  requestUrl: string
) {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  const baseUrl = requestUrl.split('?')[0];
  const nextPage = hasNext ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null;
  const prevPage = hasPrev ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null;
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext,
      hasPrev,
      nextPage,
      prevPage,
    },
  };
}

/**
 * Utility to safely parse JSON with error handling
 */
export async function safeJsonParse<T = any>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch (error) {
    throw createError.badRequest('Invalid JSON in request body');
  }
}

/**
 * Utility to validate content type
 */
export function validateContentType(request: NextRequest, expectedType = 'application/json') {
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes(expectedType)) {
    throw createError.badRequest(`Content-Type must be ${expectedType}`);
  }
}