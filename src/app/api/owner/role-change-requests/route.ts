import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withGet, withPost } from '@/lib/api-middleware';
import { logActivity, ActivityTemplates } from '@/services/notification-service';
import { NotificationType } from '@prisma/client';
// Fallback any-typed prisma to avoid transient type generation mismatch
const db: any = prisma;
import { UserRole } from '@prisma/client';

const APPROVAL_THRESHOLD = 3;
const REQUEST_TTL_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

interface ApiContext {
  user?: { id: string; role?: string };
  searchParams?: URLSearchParams;
}

async function handleGet(_req: NextRequest, context: ApiContext) {
  const { user } = context;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let requests = await db.roleChangeRequest.findMany({
      where: {},
      orderBy: { createdAt: 'desc' },
      include: {
        targetUser: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
        requestedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
        approvals: { select: { id: true, approverId: true, approved: true, reason: true } }
      }
    });

    // Auto-cancel expired pending requests
    const now = new Date();
    const expiredIds: string[] = [];
    for (const r of requests) {
      if (r.status === 'PENDING' && r.expiresAt && r.expiresAt < now) {
        expiredIds.push(r.id);
      }
    }
    if (expiredIds.length) {
      await db.roleChangeRequest.updateMany({ where: { id: { in: expiredIds } }, data: { status: 'CANCELLED' } });
      requests = await db.roleChangeRequest.findMany({
        where: {},
        orderBy: { createdAt: 'desc' },
        include: {
          targetUser: { select: { id: true, email: true, firstName: true, lastName: true, role: true } },
          requestedBy: { select: { id: true, email: true, firstName: true, lastName: true } },
          approvals: { select: { id: true, approverId: true, approved: true, reason: true } }
        }
      });
    }

    return NextResponse.json({ requests });
  } catch (e) {
    console.error('Error fetching role change requests', e);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}

async function handlePost(req: NextRequest, context: ApiContext) {
  const { user } = context;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { targetUserId, newRole, reason } = body as { targetUserId: string; newRole: UserRole; reason?: string };

  if (!targetUserId || !newRole) {
    return NextResponse.json({ error: 'targetUserId and newRole are required' }, { status: 400 });
  }

  // Only owners can initiate role change requests
  const requester = await prisma.user.findUnique({ where: { id: user.id } });
  if (!requester || requester.role !== 'OWNER') {
    return NextResponse.json({ error: 'Only owners can request role changes' }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!target) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });

  if (target.role === newRole) {
    return NextResponse.json({ error: 'User already has this role' }, { status: 400 });
  }

  try {
    const request = await db.roleChangeRequest.create({
      data: {
        targetUserId,
        requestedById: requester.id,
        newRole,
        reason: reason || null,
        expiresAt: new Date(Date.now() + REQUEST_TTL_MS),
      },
      include: {
        targetUser: true,
        requestedBy: true,
        approvals: true,
      }
    });

    // Notify all owners about the pending request
    const owners = await prisma.user.findMany({ where: { role: 'OWNER', status: 'ACTIVE' } });
    const notificationsData = owners.filter(o => o.id !== requester.id).map(o => ({
      userId: o.id,
      type: 'ADMIN_MESSAGE' as NotificationType,
      title: 'Role Change Request',
      message: `Request to change role of ${target.email} to ${newRole}.`,
    }));
    if (notificationsData.length) {
      await prisma.notification.createMany({ data: notificationsData });
    }

    // Audit log
    await logActivity({
      userId: requester.id,
      ...ActivityTemplates.createRoleChangeRequest(target.email, newRole),
      metadata: { requestId: request.id, targetUserId, newRole, reason: reason || null }
    });

    return NextResponse.json({ request }, { status: 201 });
  } catch (e) {
    console.error('Error creating role change request', e);
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}

export const GET = withGet(handleGet, { requireAuth: true, logRequest: true });
export const POST = withPost(handlePost, { requireAuth: true, logRequest: true });
