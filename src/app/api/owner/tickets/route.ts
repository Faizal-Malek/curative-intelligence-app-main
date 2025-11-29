import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const actingUser = await prisma.user.findUnique({
      where: { clerkId: supabaseUser.id },
      select: { id: true, role: true, firstName: true, lastName: true, email: true },
    });
    if (!actingUser || (actingUser.role !== 'OWNER' && actingUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden - Owner/Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const subject = (body?.subject || '').toString().trim();
    const description = (body?.description || '').toString().trim();
    const message = (body?.message || description || '').toString().trim();
    const category = (body?.category || 'General').toString();
    const priority = (body?.priority || 'MEDIUM').toString().toUpperCase();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    const created = await prisma.supportTicket.create({
      data: {
        subject,
        description: description || message,
        category,
        priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority) ? (priority as any) : 'MEDIUM',
        status: 'OPEN',
        userId: actingUser.id,
        messages: {
          create: {
            senderId: actingUser.id,
            senderName: actingUser.firstName && actingUser.lastName ? `${actingUser.firstName} ${actingUser.lastName}` : (actingUser.email || 'Owner'),
            isAdmin: true,
            message,
          }
        }
      },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        messages: { orderBy: { createdAt: 'asc' } }
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
