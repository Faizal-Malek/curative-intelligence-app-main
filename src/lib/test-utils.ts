/**
 * Testing utilities and setup for comprehensive test coverage
 */

import { vi } from 'vitest';

// Mock environment variables for testing
export const mockEnvVars = {
  NODE_ENV: 'test',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
};

// Setup environment variables
export function setupTestEnv() {
  Object.entries(mockEnvVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

// Mock user data for testing
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  supabaseId: 'test-supabase-id',
  onboardingComplete: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockBrandProfile = {
  id: 'test-brand-id',
  userId: 'test-user-id',
  brandName: 'Test Brand',
  industry: 'Technology',
  brandDescription: 'A test brand for testing purposes',
  brandVoiceDescription: 'Professional and friendly',
  primaryGoal: 'Increase brand awareness',
  doRules: ['Be authentic', 'Stay professional'],
  dontRules: ['Avoid controversial topics'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Mock API responses
export const mockApiResponses = {
  dashboardStats: {
    scheduledPosts: 5,
    ideasInVault: 10,
    engagementDelta: 18,
    recentActivity: 3,
  },
  generationBatch: {
    success: true,
    batchId: 'test-batch-id',
  },
  health: {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'healthy',
      supabase: 'healthy',
    },
  },
};

// Mock Prisma client for testing
export function createMockPrismaClient() {
  return {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    brandProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    influencerProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    },
    post: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    generationBatch: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    socialMediaAccount: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $disconnect: vi.fn(),
    $connect: vi.fn(),
  };
}

// Mock Supabase client for testing
export function createMockSupabaseClient() {
  return {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  };
}

// API testing utilities
export function createMockRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  headers?: Record<string, string>
) {
  return new Request('http://localhost:3000/api/test', {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

export function createMockNextRequest(
  url: string = 'http://localhost:3000/api/test',
  init?: RequestInit
) {
  const request = new Request(url, init);
  // Add Next.js specific properties
  (request as any).nextUrl = new URL(url);
  (request as any).ip = '127.0.0.1';
  (request as any).geo = { country: 'US' };
  return request;
}

// Test data generators
export function generateTestUser(overrides: Partial<typeof mockUser> = {}) {
  return {
    ...mockUser,
    ...overrides,
    id: overrides.id || `test-user-${Math.random().toString(36).substr(2, 9)}`,
  };
}

export function generateTestBrandProfile(overrides: Partial<typeof mockBrandProfile> = {}) {
  return {
    ...mockBrandProfile,
    ...overrides,
    id: overrides.id || `test-brand-${Math.random().toString(36).substr(2, 9)}`,
  };
}

// Performance testing utilities
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  const start = performance.now();
  const result = fn();

  if (result instanceof Promise) {
    return result.then((value) => {
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return value;
    });
  } else {
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
    return result;
  }
}

// Database testing utilities
export async function setupTestDatabase() {
  // This would set up a test database
  console.log('Setting up test database...');
}

export async function cleanupTestDatabase() {
  // This would clean up the test database
  console.log('Cleaning up test database...');
}

// Component testing utilities
export function mockIntersectionObserver() {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  window.IntersectionObserverEntry = vi.fn();
}

export function mockResizeObserver() {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
}

// Error testing utilities
export function expectErrorToBeThrown(
  fn: () => any,
  expectedError: string | RegExp
) {
  try {
    fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (typeof expectedError === 'string') {
      if ((error as Error).message !== expectedError) {
        throw new Error(`Expected error message "${expectedError}", got "${(error as Error).message}"`);
      }
    } else {
      if (!expectedError.test((error as Error).message)) {
        throw new Error(`Expected error message to match ${expectedError}, got "${(error as Error).message}"`);
      }
    }
  }
}

// Async testing utilities
export function waitFor(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        reject(new Error('Timeout waiting for condition'));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

// Network testing utilities
export function mockFetch(responses: Record<string, any>) {
  const originalFetch = global.fetch;
  
  global.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    const response = responses[url];
    if (!response) {
      return Promise.reject(new Error(`No mock response for ${url}`));
    }
    
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    } as Response);
  }) as typeof fetch;
  
  return () => {
    global.fetch = originalFetch;
  };
}

// Test cleanup utilities
export function createTestCleanup() {
  const cleanupFns: (() => void)[] = [];
  
  return {
    add: (fn: () => void) => cleanupFns.push(fn),
    cleanup: () => cleanupFns.forEach(fn => fn()),
  };
}

// Accessibility testing utilities
export function checkAccessibility(element: HTMLElement) {
  // Basic accessibility checks
  const checks = {
    hasAriaLabel: element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby'),
    hasRole: element.hasAttribute('role'),
    hasTabIndex: element.hasAttribute('tabindex'),
    isKeyboardAccessible: element.tabIndex >= 0 || element.getAttribute('role') === 'button',
  };
  
  return checks;
}

export { vi } from 'vitest';