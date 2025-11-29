import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPost } from '@/lib/api-middleware';
import { logActivity, ActivityTemplates } from '@/services/notification-service';
import { NotificationType } from '@prisma/client';
const db: any = prisma;

interface ApiContext { user?: { id: string } ; params?: Record<string,string|string[]|undefined> }
function normalize(v?: string | string[]) { return Array.isArray(v) ? v[0] : v; }

async function handlePost(req: NextRequest, context: ApiContext) {
  const { user, params } = context;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = normalize(params?.id);
  if (!id) return NextResponse.json({ error: 'Missing request id' }, { status: 400 });

  const body = await req.json();
  const reason = (body?.reason as string) || null;

  try {
    const requester = await prisma.user.findUnique({ where: { id: user.id } });
    if (!requester || requester.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can reject' }, { status: 403 });
    }

    const request = await db.roleChangeRequest.findUnique({
      where: { id },
      include: { approvals: true, targetUser: true }
    });
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request not pending' }, { status: 400 });
    }

    await db.roleChangeApproval.upsert({
      where: { requestId_approverId: { requestId: request.id, approverId: requester.id } },
      update: { approved: false, reason },
      create: { requestId: request.id, approverId: requester.id, approved: false, reason }
    });

    // Mark request rejected immediately on any rejection
    await db.roleChangeRequest.update({ where: { id: request.id }, data: { status: 'REJECTED' } });

    // Notify owners
    const owners = await db.user.findMany({ where: { role: 'OWNER', status: 'ACTIVE' } });
    const notificationsData = owners.map((o: any) => ({
      userId: o.id,
      type: 'WARNING' as NotificationType,
      title: 'Role Change Rejected',
      message: `Role change for ${request.targetUser.email} rejected. Reason: ${reason || 'No reason provided'}`,
    }));
    await db.notification.createMany({ data: notificationsData });

    // Audit log
    await logActivity({
      userId: requester.id,
      ...ActivityTemplates.rejectRoleChangeRequest(request.targetUser.email, request.newRole),
      metadata: { requestId: request.id, targetUserId: request.targetUserId, newRole: request.newRole, reason }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error rejecting role change', e);
    return NextResponse.json({ error: 'Failed to reject' }, { status: 500 });
  }
}

export const POST = withPost(handlePost, { requireAuth: true, logRequest: true });
