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

    // TODO: Add role check after migration
    // Check if user is admin
    // const user = await prisma.user.findUnique({
    //   where: { clerkId: supabaseUser.id },
    //   select: { role: true },
    // });

    // if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
    //   return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    // }

    // Get all users with relevant information
    // TODO: Add status, role, lastLoginAt, loginCount after migration
    // TODO: Add supportTickets count after migration
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        plan: true,
        // status: true,
        userType: true,
        // role: true,
        // lastLoginAt: true,
        // loginCount: true,
        createdAt: true,
        updatedAt: true,
        onboardingComplete: true,
        _count: {
          select: {
            posts: true,
            socialMediaAccounts: true,
            // supportTickets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
