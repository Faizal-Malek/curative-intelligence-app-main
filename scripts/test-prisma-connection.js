const { PrismaClient } = require('@prisma/client');

function withPgBouncerParam(url) {
  if (!url) return url;
  if (/([?&])pgbouncer=true(?!\w)/i.test(url)) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}pgbouncer=true`;
}

(async () => {
  try {
    const url = withPgBouncerParam(process.env.DATABASE_URL);
    const prisma = new PrismaClient({
      datasources: url ? { db: { url } } : undefined,
    });
    console.log('Testing Prisma connection with URL:', url ? url.replace(/:[^@]+@/, ':***@') : '(missing)');
    const r = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log('Raw query ok:', r);
    const anyUser = await prisma.user.findFirst();
    console.log('findFirst user ok:', !!anyUser);
    await prisma.$disconnect();
    console.log('Prisma connection test completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Prisma connection test failed:', err);
    process.exit(1);
  }
})();
