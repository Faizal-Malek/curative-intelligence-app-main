import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { getCachedOwnerProfile } from '@/lib/owner-context';
import { getOverdueUsersSnapshot } from '@/lib/owner-dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const owner = await getCachedOwnerProfile(supabaseUser.id);
    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const users = await getOverdueUsersSnapshot();
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching overdue users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overdue users' },
      { status: 500 }
    );
  }
}
