/**
 * Production monitoring, logging, and observability utilities
 */

import { NextRequest } from 'next/server';

// Log levels
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

// Log entry interface
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  requestId?: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  statusCode?: number;
  method?: string;
  url?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Performance metrics interface
export interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userId?: string;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
}

// Health check interface
export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: boolean;
    redis?: boolean;
    externalApis: {
      instagram: boolean;
      facebook: boolean;
      twitter: boolean;
      linkedin: boolean;
    };
  };
  metrics: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    responseTime: number;
  };
}

// Logger class
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logLevel = process.env.LOG_LEVEL || (this.isDevelopment ? 'debug' : 'info');

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.CRITICAL];
    const currentLevelIndex = levels.indexOf(this.logLevel as LogLevel);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= currentLevelIndex;
  }

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Human-readable format for development
      const timestamp = new Date(entry.timestamp).toLocaleTimeString();
      const context = entry.context ? ` | ${JSON.stringify(entry.context)}` : '';
      return `[${timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${context}`;
    } else {
      // JSON format for production (better for log aggregation)
      return JSON.stringify(entry);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, context);
    const formattedLog = this.formatLog(entry);

    // Output to appropriate stream
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      console.error(formattedLog);
    } else if (level === LogLevel.WARN) {
      console.warn(formattedLog);
    } else {
      console.log(formattedLog);
    }

    // In production, you might want to send logs to external services
    if (!this.isDevelopment) {
      this.sendToExternalLogger(entry);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  critical(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.CRITICAL, message, context);
  }

  // Request logging
  logRequest(
    request: NextRequest,
    requestId: string,
    userId?: string,
    additionalContext?: Record<string, any>
  ): void {
    const context = {
      requestId,
      method: request.method,
      url: request.url,
      userId,
      ip: this.getClientIp(request),
      userAgent: request.headers.get('user-agent'),
      ...additionalContext,
    };

    this.info('Incoming request', context);
  }

  // Response logging
  logResponse(
    requestId: string,
    statusCode: number,
    duration: number,
    additionalContext?: Record<string, any>
  ): void {
    const context = {
      requestId,
      statusCode,
      duration: `${duration}ms`,
      ...additionalContext,
    };

    const level = statusCode >= 500 ? LogLevel.ERROR : 
                 statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

    this.log(level, 'Request completed', context);
  }

  // Error logging with stack trace
  logError(
    error: Error,
    context?: Record<string, any>
  ): void {
    const errorContext = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...context,
    };

    this.error('Application error', errorContext);
  }

  private getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    return forwarded?.split(',')[0]?.trim() || 
           request.headers.get('x-real-ip') || 
           request.headers.get('cf-connecting-ip') ||
           'unknown';
  }

  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    // Implement external logging service integration here
    // Examples: Datadog, New Relic, Sentry, LogDNA, etc.
    
    try {
      // Example webhook or API call
      if (process.env.LOG_WEBHOOK_URL) {
        await fetch(process.env.LOG_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        });
      }
    } catch (error) {
      // Don't let logging failures break the application
      console.error('Failed to send log to external service:', error);
    }
  }
}

// Performance monitoring
class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000; // Keep last 1000 requests in memory

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only recent metrics in memory
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (metric.responseTime > 5000) { // 5 seconds
      logger.warn('Slow request detected', {
        requestId: metric.requestId,
        method: metric.method,
        url: metric.url,
        responseTime: `${metric.responseTime}ms`,
      });
    }

    // Send to external monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(metric);
    }
  }

  getAverageResponseTime(minutes = 5): number {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(
      m => new Date(m.timestamp).getTime() > cutoff
    );
    
    if (recentMetrics.length === 0) return 0;
    
    const total = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return Math.round(total / recentMetrics.length);
  }

  getErrorRate(minutes = 5): number {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(
      m => new Date(m.timestamp).getTime() > cutoff
    );
    
    if (recentMetrics.length === 0) return 0;
    
    const errors = recentMetrics.filter(m => m.statusCode >= 400).length;
    return Math.round((errors / recentMetrics.length) * 100);
  }

  private async sendToMonitoringService(metric: PerformanceMetrics): Promise<void> {
    try {
      // Example: Send to monitoring service API
      if (process.env.MONITORING_API_URL) {
        await fetch(process.env.MONITORING_API_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`,
          },
          body: JSON.stringify(metric),
        });
      }
    } catch (error) {
      logger.debug('Failed to send metric to monitoring service', { error: error });
    }
  }
}

// Health check system
class HealthChecker {
  async checkHealth(): Promise<HealthCheck> {
    const start = Date.now();
    
    const [dbHealth, apiHealth] = await Promise.all([
      this.checkDatabase(),
      this.checkExternalApis(),
    ]);

    const responseTime = Date.now() - start;
    
    const services = {
      database: dbHealth,
      externalApis: apiHealth,
    };

    const allHealthy = dbHealth && Object.values(apiHealth).every(Boolean);
    
    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
      metrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        responseTime,
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      // Basic database connectivity check
      const { prisma } = await import('@/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', { error });
      return false;
    }
  }

  private async checkExternalApis(): Promise<{
    instagram: boolean;
    facebook: boolean;
    twitter: boolean;
    linkedin: boolean;
  }> {
    const checks = await Promise.allSettled([
      this.checkInstagramApi(),
      this.checkFacebookApi(),
      this.checkTwitterApi(),
      this.checkLinkedInApi(),
    ]);

    return {
      instagram: checks[0].status === 'fulfilled' && checks[0].value,
      facebook: checks[1].status === 'fulfilled' && checks[1].value,
      twitter: checks[2].status === 'fulfilled' && checks[2].value,
      linkedin: checks[3].status === 'fulfilled' && checks[3].value,
    };
  }

  private async checkInstagramApi(): Promise<boolean> {
    try {
      if (!process.env.INSTAGRAM_CLIENT_ID) return false;
      
      // Basic API endpoint check
      const response = await fetch('https://api.instagram.com/oauth/authorize', {
        method: 'HEAD',
      });
      return response.status < 500;
    } catch {
      return false;
    }
  }

  private async checkFacebookApi(): Promise<boolean> {
    try {
      if (!process.env.FACEBOOK_APP_ID) return false;
      
      const response = await fetch('https://graph.facebook.com/me?access_token=invalid', {
        method: 'GET',
      });
      // Should return 400 (bad token) not 500 (server error)
      return response.status === 400;
    } catch {
      return false;
    }
  }

  private async checkTwitterApi(): Promise<boolean> {
    try {
      if (!process.env.TWITTER_BEARER_TOKEN) return false;
      
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer invalid_token`,
        },
      });
      // Should return 401 (unauthorized) not 500 (server error)
      return response.status === 401;
    } catch {
      return false;
    }
  }

  private async checkLinkedInApi(): Promise<boolean> {
    try {
      if (!process.env.LINKEDIN_CLIENT_ID) return false;
      
      const response = await fetch('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': 'Bearer invalid_token',
        },
      });
      // Should return 401 (unauthorized) not 500 (server error)
      return response.status === 401;
    } catch {
      return false;
    }
  }
}

// Global instances
export const logger = new Logger();
export const performanceMonitor = new PerformanceMonitor();
export const healthChecker = new HealthChecker();

// Utility functions
export function createRequestTimer() {
  const start = Date.now();
  return {
    end: () => Date.now() - start,
  };
}

export function captureException(error: Error, context?: Record<string, any>): void {
  logger.logError(error, context);
  
  // In production, send to error tracking service like Sentry
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // Sentry.captureException(error, { extra: context });
  }
}

export function startPerformanceMonitoring(): void {
  // Memory usage monitoring
  setInterval(() => {
    const usage = process.memoryUsage();
    const usageInMB = {
      rss: Math.round(usage.rss / 1024 / 1024),
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
      external: Math.round(usage.external / 1024 / 1024),
    };

    // Log if memory usage is high
    if (usageInMB.heapUsed > 512) { // 512MB
      logger.warn('High memory usage detected', { memoryUsage: usageInMB });
    }
  }, 60000); // Check every minute

  // Periodic health checks
  setInterval(async () => {
    try {
      const health = await healthChecker.checkHealth();
      if (health.status !== 'healthy') {
        logger.warn('Health check failed', { health });
      }
    } catch (error) {
      logger.error('Health check error', { error });
    }
  }, 300000); // Check every 5 minutes

  logger.info('Performance monitoring started');
}

// Request tracking middleware helper
export function trackRequest(
  requestId: string,
  method: string,
  url: string,
  userId?: string
) {
  const timer = createRequestTimer();
  
  return {
    finish: (statusCode: number, additionalContext?: Record<string, any>) => {
      const responseTime = timer.end();
      
      const metric: PerformanceMetrics = {
        requestId,
        method,
        url,
        statusCode,
        responseTime,
        timestamp: new Date().toISOString(),
        userId,
        memoryUsage: process.memoryUsage(),
      };

      performanceMonitor.recordMetric(metric);
      logger.logResponse(requestId, statusCode, responseTime, additionalContext);
    },
  };
}