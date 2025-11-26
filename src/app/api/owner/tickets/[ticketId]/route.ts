import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
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
      select: { role: true },
    });
    if (!actingUser || (actingUser.role !== 'OWNER' && actingUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Owner/Admin access required' }, { status: 403 });
    }

    const { ticketId } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket);
  } catch (err) {
    console.error('Error fetching ticket:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
