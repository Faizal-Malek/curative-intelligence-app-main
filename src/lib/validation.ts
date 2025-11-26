/**
 * Validation utilities for API inputs and form data
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// UUID validation
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// String length validation
export function validateStringLength(
  str: string,
  minLength: number,
  maxLength: number
): boolean {
  return str.length >= minLength && str.length <= maxLength;
}

// URL validation
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Payment status validation
export const PaymentStatuses = ['PAID', 'UNPAID', 'OVERDUE', 'CANCELLED'] as const;
export type PaymentStatus = typeof PaymentStatuses[number];

export function validatePaymentStatus(status: string): status is PaymentStatus {
  return PaymentStatuses.includes(status as PaymentStatus);
}

// User role validation
export const UserRoles = ['USER', 'ADMIN', 'OWNER'] as const;
export type UserRole = typeof UserRoles[number];

export function validateUserRole(role: string): role is UserRole {
  return UserRoles.includes(role as UserRole);
}

// User status validation
export const UserStatuses = ['ACTIVE', 'SUSPENDED', 'INACTIVE', 'DELETED'] as const;
export type UserStatus = typeof UserStatuses[number];

export function validateUserStatus(status: string): status is UserStatus {
  return UserStatuses.includes(status as UserStatus);
}

// Plan validation
export const Plans = ['free', 'basic', 'pro', 'enterprise'] as const;
export type Plan = typeof Plans[number];

export function validatePlan(plan: string): plan is Plan {
  return Plans.includes(plan as Plan);
}

// Navigation items validation
export const NavigationItems = [
  'dashboard',
  'calendar',
  'vault',
  'analytics',
  'profile',
  'pricing',
  'settings',
  'support',
] as const;
export type NavigationItem = typeof NavigationItems[number];

export function validateNavigationItems(items: string[]): items is NavigationItem[] {
  return items.every(item => NavigationItems.includes(item as NavigationItem));
}

// Sanitize string (remove dangerous characters)
export function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Validate and sanitize user input
export function validateUserInput(input: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  bio?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (input.email && !validateEmail(input.email)) {
    errors.push('Invalid email format');
  }

  if (input.firstName && !validateStringLength(input.firstName, 1, 50)) {
    errors.push('First name must be between 1 and 50 characters');
  }

  if (input.lastName && !validateStringLength(input.lastName, 1, 50)) {
    errors.push('Last name must be between 1 and 50 characters');
  }

  if (input.phone && !validateStringLength(input.phone, 10, 20)) {
    errors.push('Phone number must be between 10 and 20 characters');
  }

  if (input.company && !validateStringLength(input.company, 1, 100)) {
    errors.push('Company name must be between 1 and 100 characters');
  }

  if (input.location && !validateStringLength(input.location, 1, 100)) {
    errors.push('Location must be between 1 and 100 characters');
  }

  if (input.bio && !validateStringLength(input.bio, 0, 500)) {
    errors.push('Bio must be less than 500 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Rate limiting helper (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    // New window
    const resetAt = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxRequests - 1, resetAt };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt };
}
