import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerFromCookies } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';
import { generateWorkspaceContent } from '@/services/ai-workspace-generator';
import { createNotification, logActivity, NotificationTemplates } from '@/services/notification-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServerFromCookies();
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: supabaseUser.id },
      include: {
        brandProfile: true,
        influencerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { onboardingData } = body;

    // Generate personalized workspace content using AI
    const workspaceContent = await generateWorkspaceContent(user, onboardingData);

    // Save generated content ideas to vault
    if (workspaceContent.contentIdeas && workspaceContent.contentIdeas.length > 0) {
      await prisma.post.createMany({
        data: workspaceContent.contentIdeas.map((idea: any) => ({
          userId: user.id,
          content: idea.caption, // Main content field
          caption: idea.caption, // Also store in caption for compatibility
          platform: idea.platform || 'instagram',
          status: 'AWAITING_REVIEW',
          hashtags: idea.hashtags || [],
          mentions: idea.mentions || [],
          aiGenerated: true,
          metadata: {
            generatedFrom: 'workspace-setup',
            category: idea.category,
            tone: idea.tone,
            goalAlignment: idea.goalAlignment,
          },
        })),
      });
    }

    // Store workspace configuration
    const workspaceConfig = {
      templates: workspaceContent.templates,
      dashboardLayout: workspaceContent.dashboardLayout,
      recommendedSchedule: workspaceContent.recommendedSchedule,
      contentPillars: workspaceContent.contentPillars,
      generatedAt: new Date().toISOString(),
    };

    // Store workspace config in user's bio field temporarily
    // TODO: Add metadata JSON field after migration
    const workspaceConfigString = JSON.stringify(workspaceConfig);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        bio: workspaceConfigString.substring(0, 500), // Store first 500 chars in bio as temp storage
      },
    });

    // Create success notification for user
    const notificationTemplate = NotificationTemplates.workspaceGenerated(
      workspaceContent.contentIdeas.length,
      workspaceContent.templates.length
    );
    
    await createNotification({
      userId: user.id,
      ...notificationTemplate,
      actionUrl: '/vault', // Link to vault where content ideas are stored
    });

    // Log activity
    await logActivity({
      userId: user.id,
      action: 'GENERATE_CONTENT',
      description: `Generated personalized workspace with ${workspaceContent.contentIdeas.length} content ideas`,
      metadata: {
        contentIdeasCount: workspaceContent.contentIdeas.length,
        templatesCount: workspaceContent.templates.length,
        userType: user.userType,
        onboardingData,
      },
    });

    return NextResponse.json({
      success: true,
      workspace: {
        contentIdeasCount: workspaceContent.contentIdeas.length,
        templatesCount: workspaceContent.templates.length,
        contentPillars: workspaceContent.contentPillars,
        dashboardPersonalization: workspaceContent.dashboardLayout,
      },
    });
  } catch (error) {
    console.error('Error generating workspace:', error);
    return NextResponse.json(
      { error: 'Failed to generate workspace' },
      { status: 500 }
    );
  }
}
