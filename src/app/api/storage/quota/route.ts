// File Path: src/app/api/storage/quota/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withGet } from '@/lib/api-middleware';
import { getUserStorage } from '@/lib/storage';

type ApiContext = {
  user?: {
    id: string;
    email: string | null;
  };
};

async function handleGet(_request: NextRequest, context: ApiContext) {
  const { user } = context;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const storage = await getUserStorage(user.id);
    return NextResponse.json({ storage }, { status: 200 });
  } catch (error) {
    console.error('Error fetching storage quota:', error);
    return NextResponse.json(
      { error: 'Failed to fetch storage quota' },
      { status: 500 }
    );
  }
}

export const GET = withGet(handleGet, {
  requireAuth: true,
  logRequest: true,
});
