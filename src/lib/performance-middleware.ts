import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// Simple request ID generator
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function performanceMiddleware(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Log incoming request
  logger.apiRequest(method, pathname, {
    requestId,
    userAgent: request.headers.get('user-agent'),
  });

  // Clone the request to pass through
  const response = NextResponse.next();

  // Add request ID to response headers
  response.headers.set('X-Request-ID', requestId);

  // Add performance headers
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);

  // Log response
  const duration = Date.now() - startTime;
  logger.apiResponse(method, pathname, response.status, duration);

  // Warn on slow requests
  if (duration > 3000) {
    logger.warn(`Slow request detected: ${method} ${pathname}`, {
      duration,
      requestId,
    });
  }

  return response;
}

// Export for use in main middleware
export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const requestId = generateRequestId();
    
    try {
      const response = await handler(request);
      const duration = Date.now() - startTime;
      
      // Add headers
      response.headers.set('X-Request-ID', requestId);
      response.headers.set('X-Response-Time', `${duration}ms`);
      
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(
        `Request failed: ${request.method} ${request.nextUrl.pathname}`,
        error as Error,
        { requestId, duration }
      );
      throw error;
    }
  };
}
