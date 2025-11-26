import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { getCachedOwnerProfile } from '@/lib/owner-context';
import { getOwnerStatsSnapshot } from '@/lib/owner-dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner
    const user = await getCachedOwnerProfile(supabaseUser.id);
    
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden - Owner access required' }, { status: 403 });
    }

    const stats = await getOwnerStatsSnapshot();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching owner dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
