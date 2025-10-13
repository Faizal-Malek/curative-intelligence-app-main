/**
 * Centralized error handling utilities for production-ready error management
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ErrorCode = 
  | 'UNAUTHORIZED'
  | 'FORBIDDEN' 
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'
  | 'RATE_LIMITED'
  | 'EXTERNAL_API_ERROR'
  | 'DATABASE_ERROR'
  | 'NETWORK_ERROR';

export interface AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  isOperational: boolean;
  context?: Record<string, any>;
}

export class CustomError extends Error implements AppError {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'CustomError';
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Ensure proper prototype chain
    Object.setPrototypeOf(this, CustomError.prototype);
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

// Pre-defined error factories
export const createError = {
  unauthorized: (message = 'Unauthorized access', context?: Record<string, any>) =>
    new CustomError(message, 'UNAUTHORIZED', 401, true, context),
    
  forbidden: (message = 'Access forbidden', context?: Record<string, any>) =>
    new CustomError(message, 'FORBIDDEN', 403, true, context),
    
  notFound: (resource = 'Resource', context?: Record<string, any>) =>
    new CustomError(`${resource} not found`, 'NOT_FOUND', 404, true, context),
    
  validation: (message = 'Validation failed', context?: Record<string, any>) =>
    new CustomError(message, 'VALIDATION_ERROR', 400, true, context),
    
  badRequest: (message = 'Bad request', context?: Record<string, any>) =>
    new CustomError(message, 'BAD_REQUEST', 400, true, context),
    
  internal: (message = 'Internal server error', context?: Record<string, any>) =>
    new CustomError(message, 'INTERNAL_ERROR', 500, false, context),
    
  rateLimit: (message = 'Rate limit exceeded', context?: Record<string, any>) =>
    new CustomError(message, 'RATE_LIMITED', 429, true, context),
    
  externalApi: (service: string, message?: string, context?: Record<string, any>) =>
    new CustomError(
      message || `External API error: ${service}`,
      'EXTERNAL_API_ERROR',
      502,
      true,
      { service, ...context }
    ),
    
  database: (operation: string, message?: string, context?: Record<string, any>) =>
    new CustomError(
      message || `Database error: ${operation}`,
      'DATABASE_ERROR',
      500,
      false,
      { operation, ...context }
    ),
    
  network: (message = 'Network error occurred', context?: Record<string, any>) =>
    new CustomError(message, 'NETWORK_ERROR', 503, true, context),
};

/**
 * Parse and format Zod validation errors
 */
export function formatZodError(error: ZodError): string {
  const issues = error.issues.map(issue => {
    const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
    return `${path}: ${issue.message}`;
  });
  return issues.join(', ');
}

/**
 * Format error for API response
 */
export function formatErrorResponse(error: unknown): {
  error: string;
  code: ErrorCode;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
} {
  const timestamp = new Date().toISOString();
  
  // Handle CustomError
  if (error instanceof CustomError) {
    return {
      error: 'Application Error',
      code: error.code,
      message: error.message,
      context: error.context,
      timestamp,
    };
  }
  
  // Handle ZodError
  if (error instanceof ZodError) {
    return {
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      message: formatZodError(error),
      context: { issues: error.issues },
      timestamp,
    };
  }
  
  // Handle standard Error
  if (error instanceof Error) {
    return {
      error: 'Internal Error',
      code: 'INTERNAL_ERROR',
      message: error.message,
      timestamp,
    };
  }
  
  // Handle unknown error types
  return {
    error: 'Unknown Error',
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    context: { originalError: String(error) },
    timestamp,
  };
}

/**
 * Create NextResponse from error
 */
export function createErrorResponse(error: unknown): NextResponse {
  const errorData = formatErrorResponse(error);
  
  // Determine status code
  let statusCode = 500;
  if (error instanceof CustomError) {
    statusCode = error.statusCode;
  } else if (error instanceof ZodError) {
    statusCode = 400;
  }
  
  // Log error for monitoring (only log non-operational errors)
  if (error instanceof CustomError && !error.isOperational) {
    console.error('[ERROR] Non-operational error:', {
      code: error.code,
      message: error.message,
      context: error.context,
      stack: error.stack,
    });
  } else if (!(error instanceof CustomError)) {
    console.error('[ERROR] Unexpected error:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
  }
  
  return NextResponse.json(errorData, { status: statusCode });
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error);
    }
  };
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof CustomError;
}

/**
 * Safely convert unknown error to Error instance
 */
export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error('Unknown error occurred');
}

/**
 * Log error with structured context
 */
export function logError(error: unknown, context?: Record<string, any>): void {
  const timestamp = new Date().toISOString();
  
  if (error instanceof CustomError) {
    console.error(`[${timestamp}] ${error.code}:`, {
      message: error.message,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      context: { ...error.context, ...context },
      stack: error.stack,
    });
  } else if (error instanceof Error) {
    console.error(`[${timestamp}] ERROR:`, {
      message: error.message,
      name: error.name,
      context,
      stack: error.stack,
    });
  } else {
    console.error(`[${timestamp}] UNKNOWN ERROR:`, {
      error: String(error),
      context,
    });
  }
}

/**
 * Sanitize error for client response (remove sensitive data)
 */
export function sanitizeErrorForClient(error: AppError): {
  message: string;
  code: ErrorCode;
} {
  // Don't expose internal error details in production
  if (!error.isOperational && process.env.NODE_ENV === 'production') {
    return {
      message: 'An internal error occurred',
      code: 'INTERNAL_ERROR',
    };
  }
  
  return {
    message: error.message,
    code: error.code,
  };
}