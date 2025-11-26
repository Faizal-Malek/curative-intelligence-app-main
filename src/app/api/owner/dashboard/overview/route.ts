import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { getCachedOwnerProfile } from '@/lib/owner-context';
import {
  getOwnerStatsSnapshot,
  getOwnerActivityLogs,
  getOverdueUsersSnapshot,
  type OwnerStatsSnapshot,
  type OwnerActivityLog,
  type OverdueUser,
} from '@/lib/owner-dashboard';

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const owner = await getCachedOwnerProfile(supabaseUser.id);
    if (!owner || owner.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const activityLimit = parseInt(searchParams.get('activityLimit') || '10', 10);
    const overdueLimit = parseInt(searchParams.get('overdueLimit') || '12', 10);

    const payload: {
      stats: OwnerStatsSnapshot | null;
      activityLogs: OwnerActivityLog[];
      overdueUsers: OverdueUser[];
      warnings: string[];
    } = {
      stats: null,
      activityLogs: [],
      overdueUsers: [],
      warnings: [],
    };

    try {
      payload.stats = await getOwnerStatsSnapshot();
    } catch (err) {
      console.error('Owner overview: stats failed', err);
      payload.warnings.push('Owner metrics unavailable.');
    }

    try {
      payload.activityLogs = await getOwnerActivityLogs(activityLimit);
    } catch (err) {
      console.error('Owner overview: activity failed', err);
      payload.warnings.push('Activity feed offline.');
    }

    try {
      payload.overdueUsers = await getOverdueUsersSnapshot(overdueLimit);
    } catch (err) {
      console.error('Owner overview: overdue users failed', err);
      payload.warnings.push('Overdue accounts endpoint offline.');
    }

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error building owner overview:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
