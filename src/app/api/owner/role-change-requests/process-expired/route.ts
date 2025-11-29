import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPost } from '@/lib/api-middleware';
import { logActivity, ActivityTemplates } from '@/services/notification-service';
import { NotificationType } from '@prisma/client';
const db: any = prisma;

interface ApiContext { user?: { id: string }; }

async function handlePost(_req: NextRequest, context: ApiContext) {
  const { user } = context;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Only owners can trigger expiration processing
    const actor = await db.user.findUnique({ where: { id: user.id } });
    if (!actor || actor.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const expired = await db.roleChangeRequest.findMany({
      where: { status: 'PENDING', expiresAt: { lte: now } },
      include: { targetUser: true }
    });

    if (!expired.length) {
      return NextResponse.json({ processed: 0, message: 'No expired requests' });
    }

    const ids = expired.map((r: any) => r.id);
    await db.roleChangeRequest.updateMany({ where: { id: { in: ids } }, data: { status: 'CANCELLED' } });

    // Notifications to owners about batch expiration
    const owners = await db.user.findMany({ where: { role: 'OWNER', status: 'ACTIVE' } });
    if (owners.length) {
      await db.notification.createMany({
        data: owners.map((o: any) => ({
          userId: o.id,
          type: 'WARNING' as NotificationType,
          title: 'Expired Role Change Requests',
          message: `${expired.length} role change request(s) expired and were auto-cancelled.`,
        }))
      });
    }

    // Audit logs per expired request
    for (const r of expired) {
      await logActivity({
        userId: actor.id,
        ...ActivityTemplates.expireRoleChangeRequest(r.targetUser.email, r.newRole),
        metadata: { requestId: r.id, targetUserId: r.targetUserId, newRole: r.newRole }
      });
    }

    return NextResponse.json({ processed: expired.length, ids });
  } catch (e) {
    console.error('Process expired error', e);
    return NextResponse.json({ error: 'Failed to process expired requests' }, { status: 500 });
  }
}

export const POST = withPost(handlePost, { requireAuth: true, logRequest: true });
