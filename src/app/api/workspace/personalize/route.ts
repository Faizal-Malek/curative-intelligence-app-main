// src/app/api/workspace/personalize/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { config } = await req.json();

    if (!config) {
      return NextResponse.json(
        { message: 'Configuration is required' },
        { status: 400 }
      );
    }

    // Find user by Supabase auth ID
    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { clerkId: authUser.id },
          { email: authUser.email }
        ]
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Store config as JSON in a separate table or localStorage
    // For now, we'll use localStorage on client side
    // This endpoint just validates and returns success
    
    return NextResponse.json({
      success: true,
      message: 'Workspace personalized successfully',
      config,
    });
  } catch (error) {
    console.error('Workspace personalization error:', error);
    return NextResponse.json(
      { message: 'Failed to personalize workspace' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, config will be stored client-side
    // Return empty config - client will check localStorage
    
    return NextResponse.json({
      config: null,
    });
  } catch (error) {
    console.error('Get workspace config error:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve workspace configuration' },
      { status: 500 }
    );
  }
}
