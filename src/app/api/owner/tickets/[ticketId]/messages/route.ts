import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

// POST /api/owner/tickets/[ticketId]/messages - Admin/Owner reply in ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actingUser = await prisma.user.findUnique({
      where: { clerkId: supabaseUser.id },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    });
    if (!actingUser || (actingUser.role !== 'OWNER' && actingUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Owner/Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const message: string = (body?.message || '').toString();
    if (!message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const { ticketId } = await params;
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const senderName = actingUser.firstName && actingUser.lastName
      ? `${actingUser.firstName} ${actingUser.lastName}`
      : actingUser.email || 'Admin';

    // Create admin message
    await prisma.ticketMessage.create({
      data: {
        ticketId: ticketId,
        senderId: actingUser.id,
        senderName,
        isAdmin: true,
        message: message.trim(),
      },
    });

    // Move ticket into IN_PROGRESS if it was OPEN/RESOLVED/CLOSED
    if (ticket.status === 'OPEN' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    const updatedTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    return NextResponse.json(updatedTicket);
  } catch (err) {
    console.error('Error sending admin message:', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
