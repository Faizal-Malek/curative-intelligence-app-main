// File Path: src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

function withPgBouncerParam(url: string | undefined): string | undefined {
  if (!url) return url;
  // If already set, return as-is
  if (/([?&])pgbouncer=true(?!\w)/i.test(url)) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}pgbouncer=true`;
}

const overriddenUrl = withPgBouncerParam(process.env.DATABASE_URL);

const createPrismaClient = () =>
  new PrismaClient({
    // Keep query logs opt-in to avoid noisy console output. Enable by setting PRISMA_LOG_QUERIES=1.
    log:
      process.env.PRISMA_LOG_QUERIES === '1'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
    datasources: overriddenUrl
      ? { db: { url: overriddenUrl } }
      : undefined,
    // Optimize connection pool settings
    // Removed pool settings as they're now in connection string
  }).$extends({
    query: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const end = performance.now();
        const time = end - start;
        
        // Log slow queries
        if (time > 1000) {
          console.warn(`[Prisma] Slow query: ${model}.${operation} took ${time.toFixed(2)}ms`);
        }
        
        return result;
      },
    },
  });

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientSingleton | undefined;
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientSingleton };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
