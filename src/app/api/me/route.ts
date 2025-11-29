import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await prisma.user.findUnique({ where: { clerkId: supabaseUser.id }, select: { id: true, email: true, role: true } });
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ user: dbUser });
  } catch (e) {
    console.error('Error fetching current user', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
