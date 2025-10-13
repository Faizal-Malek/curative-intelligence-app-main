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
    log: ['query'],
    datasources: overriddenUrl
      ? { db: { url: overriddenUrl } }
      : undefined,
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}