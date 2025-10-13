// File Path: src/app/api/user/welcome-message/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // During migration return a generic message; later we can enrich via Supabase profile

    // In a real app, you might fetch the user's name from your database here.
    // For now, we'll keep it simple.
    // const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    // const message = `Welcome back, ${user?.firstName || 'Creator'}!`;

    const message = `Welcome back!`;

    return NextResponse.json({ message });

  } catch (error) {
    console.error('[API /user/welcome-message] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
