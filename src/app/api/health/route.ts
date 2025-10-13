import { withPublic } from '@/lib/api-middleware';
import { healthChecker, logger } from '@/lib/monitoring';
import { NextResponse } from 'next/server';

export const GET = withPublic(async () => {
  try {
    const health = await healthChecker.checkHealth();
    
    const statusCode = health.status === 'healthy' ? 200 : 
                      health.status === 'degraded' ? 207 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    logger.error('Health check endpoint failed', { error });
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    }, { status: 503 });
  }
}, {
  rateLimitConfig: {
    maxRequests: 60,
    windowMs: 60 * 1000, // 1 request per second
  },
});