/**
 * Production security middleware and utilities
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { logger } from './monitoring';

// Security headers configuration
export const securityHeaders = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // XSS Protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
    "style-src 'self' 'unsafe-inline'", // Required for CSS-in-JS
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // HSTS (only for HTTPS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=()',
    'usb=()',
    'bluetooth=()'
  ].join(', '),
};

// CSRF token management
class CSRFTokenManager {
  private tokenStore = new Map<string, { token: string; timestamp: number }>();
  private readonly tokenTTL = 60 * 60 * 1000; // 1 hour

  generateToken(sessionId: string): string {
    const token = randomBytes(32).toString('hex');
    this.tokenStore.set(sessionId, {
      token,
      timestamp: Date.now(),
    });
    return token;
  }

  validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokenStore.get(sessionId);
    if (!stored) return false;

    // Check expiration
    if (Date.now() - stored.timestamp > this.tokenTTL) {
      this.tokenStore.delete(sessionId);
      return false;
    }

    return stored.token === token;
  }

  cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokenStore.entries()) {
      if (now - data.timestamp > this.tokenTTL) {
        this.tokenStore.delete(sessionId);
      }
    }
  }
}

// Input sanitization utilities
export class InputSanitizer {
  private static sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(;|\||&|\$|`|'|"|\\|\/\*|\*\/|xp_|sp_)/gi,
  ];

  private static xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload|onerror|onclick|onmouseover/gi,
  ];

  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // Remove potential XSS vectors
    let sanitized = input;
    this.xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // HTML encode special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized.trim();
  }

  static validateSQLSafety(input: string): boolean {
    return !this.sqlInjectionPatterns.some(pattern => pattern.test(input));
  }

  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  }

  static sanitizeEmailInput(email: string): string {
    return email.toLowerCase().trim().replace(/[^a-z0-9@._-]/g, '');
  }
}

// Request validation
export class RequestValidator {
  static validateContentLength(request: NextRequest, maxSize: number = 1024 * 1024): boolean {
    const contentLength = request.headers.get('content-length');
    if (!contentLength) return true; // No content-length header
    
    return parseInt(contentLength, 10) <= maxSize;
  }

  static validateUserAgent(request: NextRequest): boolean {
    const userAgent = request.headers.get('user-agent');
    if (!userAgent) return false;

    // Check for known malicious patterns
    const maliciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nessus/i,
      /burpsuite/i,
      /zmeu/i,
      /bingbot.*2\.0.*rv:.*Gecko/i, // Fake Bingbot
    ];

    return !maliciousPatterns.some(pattern => pattern.test(userAgent));
  }

  static validateRequestMethod(request: NextRequest, allowedMethods: string[]): boolean {
    return allowedMethods.includes(request.method);
  }

  static validateHostHeader(request: NextRequest): boolean {
    const host = request.headers.get('host');
    if (!host) return false;

    const allowedHosts = process.env.ALLOWED_HOSTS?.split(',') || [];
    if (allowedHosts.length === 0) return true; // No restriction in development

    return allowedHosts.some(allowedHost => 
      host === allowedHost || host.endsWith(`.${allowedHost}`)
    );
  }
}

// IP-based security
export class IPSecurity {
  private static blocklist = new Set<string>();
  private static allowlist = new Set<string>();

  static initializeFromEnv(): void {
    const blocked = process.env.BLOCKED_IPS?.split(',') || [];
    const allowed = process.env.ALLOWED_IPS?.split(',') || [];

    blocked.forEach(ip => this.blocklist.add(ip.trim()));
    allowed.forEach(ip => this.allowlist.add(ip.trim()));
  }

  static isBlocked(ip: string): boolean {
    // Check allowlist first - if IP is explicitly allowed, it's not blocked
    if (this.allowlist.has(ip)) return false;
    
    return this.blocklist.has(ip);
  }

  static blockIP(ip: string, reason: string): void {
    this.blocklist.add(ip);
    logger.warn('IP blocked', { ip, reason });
  }

  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    return forwarded?.split(',')[0]?.trim() || 
           request.headers.get('x-real-ip') || 
           request.headers.get('cf-connecting-ip') ||
           'unknown';
  }
}

// Security middleware
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    requireCSRF?: boolean;
    maxRequestSize?: number;
    allowedMethods?: string[];
    validateHost?: boolean;
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const clientIP = IPSecurity.getClientIP(request);
    
    try {
      // 1. Check IP blocklist
      if (IPSecurity.isBlocked(clientIP)) {
        logger.warn('Blocked IP attempted access', { ip: clientIP, url: request.url });
        return new NextResponse('Forbidden', { status: 403 });
      }

      // 2. Validate User-Agent
      if (!RequestValidator.validateUserAgent(request)) {
        logger.warn('Suspicious User-Agent detected', { 
          ip: clientIP, 
          userAgent: request.headers.get('user-agent') 
        });
        return new NextResponse('Bad Request', { status: 400 });
      }

      // 3. Validate Host header
      if (options.validateHost && !RequestValidator.validateHostHeader(request)) {
        logger.warn('Invalid Host header', { 
          ip: clientIP, 
          host: request.headers.get('host') 
        });
        return new NextResponse('Bad Request', { status: 400 });
      }

      // 4. Validate request method
      if (options.allowedMethods && !RequestValidator.validateRequestMethod(request, options.allowedMethods)) {
        return new NextResponse('Method Not Allowed', { status: 405 });
      }

      // 5. Validate content length
      if (!RequestValidator.validateContentLength(request, options.maxRequestSize)) {
        logger.warn('Request too large', { 
          ip: clientIP, 
          contentLength: request.headers.get('content-length') 
        });
        return new NextResponse('Payload Too Large', { status: 413 });
      }

      // 6. CSRF protection for state-changing requests
      if (options.requireCSRF && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const csrfToken = request.headers.get('x-csrf-token');
        const sessionId = request.headers.get('x-session-id') || clientIP;
        
        if (!csrfToken || !csrfTokenManager.validateToken(sessionId, csrfToken)) {
          logger.warn('CSRF token validation failed', { ip: clientIP });
          return new NextResponse('Forbidden', { status: 403 });
        }
      }

      // Execute the actual handler
      const response = await handler(request);
      
      // Add security headers to response
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;

    } catch (error) {
      logger.error('Security middleware error', { error, ip: clientIP });
      return new NextResponse('Internal Server Error', { status: 500 });
    }
  };
}

// Global instances
export const csrfTokenManager = new CSRFTokenManager();

// Initialize IP security
IPSecurity.initializeFromEnv();

// Cleanup expired CSRF tokens periodically
setInterval(() => {
  csrfTokenManager.cleanupExpiredTokens();
}, 10 * 60 * 1000); // Every 10 minutes

// Export security utilities

// Utility functions
export function generateSecureRandomString(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function hashString(input: string, algorithm: string = 'sha256'): string {
  return createHash(algorithm).update(input).digest('hex');
}

export function isSecureOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  return allowedOrigins.includes(origin) || origin.startsWith('https://');
}

export function getSecurityReport(): {
  blockedIPs: number;
  allowedIPs: number;
  activeCSRFTokens: number;
} {
  return {
    blockedIPs: (IPSecurity as any).blocklist.size,
    allowedIPs: (IPSecurity as any).allowlist.size,
    activeCSRFTokens: (csrfTokenManager as any).tokenStore.size,
  };
}