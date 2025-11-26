import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerFromCookies } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

// POST /api/support/tickets/[ticketId]/messages - Send message in ticket
export async function POST(
  request: NextRequest,
  { params }: { params: { ticketId: string } }
) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    if (error || !supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: supabaseUser.id },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { ticketId } = params;
    const body = await request.json();
    const { message } = body;

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Verify ticket belongs to user
    const ticket = await prisma.supportTicket.findFirst({
      where: {
        id: ticketId,
        userId: user.id,
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    const senderName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;

    // Create message and update ticket
    await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: user.id,
        senderName,
        isAdmin: false,
        message: message.trim(),
      },
    });

    // Update ticket status if closed/resolved
    if (ticket.status === "CLOSED" || ticket.status === "RESOLVED") {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: { status: "OPEN" },
      });
    }

    // Return updated ticket with messages
    const updatedTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
