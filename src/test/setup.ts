import { vi } from 'vitest'

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextResponse: class {
    constructor(body?: any, init?: ResponseInit) {
      return new Response(body, init)
    }
    
    static json(data: any, init?: ResponseInit) {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
      })
    }
  },
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  getSupabaseUserFromCookies: vi.fn(),
}))

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    post: {
      findMany: vi.fn(),
    },
    reminder: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))