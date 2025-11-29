import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPost } from '@/lib/api-middleware';
import { logActivity, ActivityTemplates } from '@/services/notification-service';
import { NotificationType } from '@prisma/client';
const db: any = prisma;

const APPROVAL_THRESHOLD = 3;

interface ApiContext { user?: { id: string } ; params?: Record<string,string|string[]|undefined> }

function normalize(v?: string | string[]) { return Array.isArray(v) ? v[0] : v; }

async function handlePost(req: NextRequest, context: ApiContext) {
  const { user, params } = context;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = normalize(params?.id);
  if (!id) return NextResponse.json({ error: 'Missing request id' }, { status: 400 });

  try {
    const requester = await prisma.user.findUnique({ where: { id: user.id } });
    if (!requester || requester.role !== 'OWNER') {
      return NextResponse.json({ error: 'Only owners can approve' }, { status: 403 });
    }

    const request = await db.roleChangeRequest.findUnique({
      where: { id },
      include: { approvals: true, targetUser: true, requestedBy: true }
    });
    if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: 'Request not pending' }, { status: 400 });
    }

    // Prevent requester from approving their own request
    if (request.requestedById === requester.id) {
      return NextResponse.json({ error: 'Requester cannot approve their own request' }, { status: 403 });
    }

    // Upsert approval
    await db.roleChangeApproval.upsert({
      where: { requestId_approverId: { requestId: request.id, approverId: requester.id } },
      update: { approved: true, reason: null },
      create: { requestId: request.id, approverId: requester.id, approved: true }
    });

    const activeOwners = await db.user.findMany({ where: { role: 'OWNER', status: 'ACTIVE' }, select: { id: true } });
    const otherOwners = activeOwners.filter((o: any) => o.id !== request.requestedById);

    // Audit log for approval
    await logActivity({
      userId: requester.id,
      ...ActivityTemplates.approveRoleChangeRequest(request.targetUser.email, request.newRole),
      metadata: { requestId: request.id, targetUserId: request.targetUserId, newRole: request.newRole }
    });

    // Re-fetch approvals
    const approvals: any[] = await db.roleChangeApproval.findMany({ where: { requestId: request.id, approved: true } });
    const distinctApprovals = approvals.filter((a: any) => a.approverId !== request.requestedById);
    const requiredApprovals = Math.min(APPROVAL_THRESHOLD, otherOwners.length);
    if (requiredApprovals === 0 || distinctApprovals.length >= requiredApprovals) {
      // Finalize
      await db.$transaction([
        db.user.update({ where: { id: request.targetUserId }, data: { role: request.newRole } }),
        db.roleChangeRequest.update({ where: { id: request.id }, data: { status: 'APPROVED' } })
      ]);

      // Notify participants
      const owners = await db.user.findMany({ where: { role: 'OWNER', status: 'ACTIVE' } });
      const notificationsData = owners.map((o: any) => ({
        userId: o.id,
        type: 'SUCCESS' as NotificationType,
        title: 'Role Change Approved',
        message: `${request.targetUser.email} is now ${request.newRole}.`,
      }));
      await db.notification.createMany({ data: notificationsData });

      // Audit log for finalization
      await logActivity({
        userId: requester.id,
        ...ActivityTemplates.finalizeRoleChangeRequest(request.targetUser.email, request.newRole),
        metadata: { requestId: request.id, targetUserId: request.targetUserId, newRole: request.newRole, approvals: distinctApprovals.length }
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Error approving role change', e);
    return NextResponse.json({ error: 'Failed to approve' }, { status: 500 });
  }
}

export const POST = withPost(handlePost, { requireAuth: true, logRequest: true });
