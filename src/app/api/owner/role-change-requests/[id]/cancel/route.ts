import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPost } from '@/lib/api-middleware';
import { logActivity, ActivityTemplates } from '@/services/notification-service';
import { NotificationType } from '@prisma/client';

interface ApiContext { user?: { id: string }; params?: Record<string,string|string[]|undefined> }
const normalize = (v?: string|string[]) => Array.isArray(v) ? v[0] : v;

async function handlePost(_req: NextRequest, context: ApiContext) {
  const { user, params } = context;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = normalize(params?.id);
  if (!id) return NextResponse.json({ error: 'Missing request id' }, { status: 400 });

  try {
    const request = await prisma.roleChangeRequest.findUnique({ where: { id }, include: { targetUser: true } });
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (request.status !== 'PENDING') return NextResponse.json({ error: 'Cannot cancel non-pending request' }, { status: 400 });
    if (request.requestedById !== user.id) return NextResponse.json({ error: 'Only original requester may cancel' }, { status: 403 });

    await prisma.roleChangeRequest.update({ where: { id }, data: { status: 'CANCELLED' } });

    // Notify owners of cancellation
    const owners = await prisma.user.findMany({ where: { role: 'OWNER', status: 'ACTIVE' } });
    await prisma.notification.createMany({
      data: owners.map(o => ({
        userId: o.id,
        type: 'WARNING' as NotificationType,
        title: 'Role Change Cancelled',
        message: `Role change request ${id} was cancelled by requester.`,
      }))
    });

    // Audit log
    await logActivity({
      userId: user.id,
      ...ActivityTemplates.cancelRoleChangeRequest(request.targetUser.email, request.newRole),
      metadata: { requestId: request.id, targetUserId: request.targetUserId, newRole: request.newRole }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Cancel error', e);
    return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 });
  }
}

export const POST = withPost(handlePost, { requireAuth: true, logRequest: true });
