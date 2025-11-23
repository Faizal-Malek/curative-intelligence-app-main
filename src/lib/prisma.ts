// File Path: src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function withPgBouncerParam(url: string | undefined): string | undefined {
  if (!url) return url;
  // If already set, return as-is
  if (/([?&])pgbouncer=true(?!\w)/i.test(url)) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}pgbouncer=true`;
}

const overriddenUrl = withPgBouncerParam(process.env.DATABASE_URL);

export const prisma =
  global.prisma ||
  new PrismaClient({
    // Keep query logs opt-in to avoid noisy console output. Enable by setting PRISMA_LOG_QUERIES=1.
    log:
      process.env.PRISMA_LOG_QUERIES === '1'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
    datasources: overriddenUrl
      ? { db: { url: overriddenUrl } }
      : undefined,
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
