// src/services/workspace-personalization.ts
import type { BusinessOwnerFormData, InfluencerFormData } from '@/lib/validations/onboarding';

export interface PersonalizedWorkspaceConfig {
  dashboardWidgets: string[];
  contentSuggestions: ContentSuggestion[];
  quickActions: QuickAction[];
  recommendedTemplates: Template[];
  brandVoiceGuidelines: BrandVoiceGuideline[];
  toneRecommendations: string[];
  goalMilestones: GoalMilestone[];
}

export interface ContentSuggestion {
  id: string;
  title: string;
  description: string;
  type: 'post' | 'campaign' | 'series';
  platforms: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
  description: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  useCase: string;
}

export interface BrandVoiceGuideline {
  aspect: string;
  guideline: string;
  examples: string[];
}

export interface GoalMilestone {
  goal: string;
  milestones: string[];
  timeline: string;
  metrics: string[];
}

/**
 * Generate personalized workspace configuration based on onboarding data
 * This can be enhanced with actual AI/LLM later
 */
export async function generatePersonalizedWorkspace(
  userType: 'business' | 'influencer',
  data: Partial<BusinessOwnerFormData> | Partial<InfluencerFormData>
): Promise<PersonalizedWorkspaceConfig> {
  if (userType === 'business') {
    return generateBusinessWorkspace(data as Partial<BusinessOwnerFormData>);
  } else {
    return generateInfluencerWorkspace(data as Partial<InfluencerFormData>);
  }
}

function generateBusinessWorkspace(data: Partial<BusinessOwnerFormData>): PersonalizedWorkspaceConfig {
  const { industry, primaryGoal, brandVoiceDescription, preferredChannels, targetDemographics } = data;

  // Dashboard widgets based on goals and industry
  const dashboardWidgets = [
    'campaign-performance',
    'content-calendar',
    'brand-voice-monitor',
  ];

  if (primaryGoal === 'brand-awareness') {
    dashboardWidgets.push('reach-analytics', 'audience-growth');
  } else if (primaryGoal === 'lead-generation') {
    dashboardWidgets.push('conversion-funnel', 'lead-tracker');
  } else if (primaryGoal === 'customer-engagement') {
    dashboardWidgets.push('engagement-metrics', 'community-insights');
  }

  // Content suggestions based on industry and goals
  const contentSuggestions: ContentSuggestion[] = [];
  
  if (industry?.toLowerCase().includes('tech') || industry?.toLowerCase().includes('software')) {
    contentSuggestions.push({
      id: 'tech-thought-leadership',
      title: 'Industry Insights Series',
      description: 'Share expert perspectives on emerging tech trends',
      type: 'series',
      platforms: Array.isArray(preferredChannels) ? preferredChannels : (preferredChannels ? [preferredChannels] : ['LinkedIn', 'Twitter']),
      priority: 'high',
    });
  }

  if (primaryGoal === 'brand-awareness') {
    contentSuggestions.push({
      id: 'brand-story',
      title: 'Brand Story Campaign',
      description: 'Share your brand journey and values',
      type: 'campaign',
      platforms: Array.isArray(preferredChannels) ? preferredChannels : (preferredChannels ? [preferredChannels] : ['Instagram', 'Facebook']),
      priority: 'high',
    });
  }

  contentSuggestions.push({
    id: 'value-prop-post',
    title: 'Value Proposition Highlights',
    description: `Show how your product solves ${targetDemographics ? 'customer' : 'audience'} pain points`,
    type: 'post',
    platforms: Array.isArray(preferredChannels) ? preferredChannels : (preferredChannels ? [preferredChannels] : ['LinkedIn']),
    priority: 'medium',
  });

  // Quick actions tailored to business needs
  const quickActions: QuickAction[] = [
    {
      id: 'create-campaign',
      label: 'Create Campaign',
      icon: 'megaphone',
      action: '/campaigns/create',
      description: 'Launch a new marketing campaign',
    },
    {
      id: 'schedule-content',
      label: 'Schedule Posts',
      icon: 'calendar',
      action: '/content/schedule',
      description: 'Plan your content calendar',
    },
    {
      id: 'generate-copy',
      label: 'Generate Copy',
      icon: 'sparkles',
      action: '/generate/copy',
      description: 'AI-powered brand copy generation',
    },
  ];

  // Recommended templates
  const recommendedTemplates: Template[] = [
    {
      id: 'product-launch',
      name: 'Product Launch Announcement',
      category: 'Marketing',
      description: 'Comprehensive product launch template',
      useCase: 'New product or feature releases',
    },
    {
      id: 'thought-leadership',
      name: 'Thought Leadership Article',
      category: 'Content',
      description: 'Establish industry expertise',
      useCase: 'Building brand authority',
    },
  ];

  // Brand voice guidelines
  const brandVoiceGuidelines: BrandVoiceGuideline[] = [];
  
  if (brandVoiceDescription) {
    const voiceLower = brandVoiceDescription.toLowerCase();
    
    if (voiceLower.includes('professional')) {
      brandVoiceGuidelines.push({
        aspect: 'Tone',
        guideline: 'Maintain a professional, authoritative voice',
        examples: [
          'Use industry-specific terminology appropriately',
          'Avoid overly casual language',
          'Cite sources and data when making claims',
        ],
      });
    }
    
    if (voiceLower.includes('friendly') || voiceLower.includes('casual')) {
      brandVoiceGuidelines.push({
        aspect: 'Approachability',
        guideline: 'Be warm and conversational',
        examples: [
          'Use contractions (we\'re, it\'s) naturally',
          'Ask questions to engage readers',
          'Share relatable stories and examples',
        ],
      });
    }
  }

  // Goal-based milestones
  const goalMilestones: GoalMilestone[] = [];
  
  if (primaryGoal) {
    const goalMap: Record<string, GoalMilestone> = {
      'brand-awareness': {
        goal: 'Build Brand Awareness',
        milestones: [
          'Establish consistent posting schedule',
          'Reach 1,000 new followers',
          'Achieve 10,000 monthly impressions',
          'Get featured in industry publications',
        ],
        timeline: '3 months',
        metrics: ['Reach', 'Impressions', 'Follower Growth', 'Share of Voice'],
      },
      'lead-generation': {
        goal: 'Generate Qualified Leads',
        milestones: [
          'Set up lead capture forms',
          'Create 5 gated content pieces',
          'Generate 50 qualified leads',
          'Achieve 5% conversion rate',
        ],
        timeline: '2 months',
        metrics: ['Lead Volume', 'Conversion Rate', 'Cost per Lead', 'Lead Quality Score'],
      },
      'customer-engagement': {
        goal: 'Increase Customer Engagement',
        milestones: [
          'Respond to all comments within 24 hours',
          'Increase engagement rate by 25%',
          'Build community of 500 active members',
          'Launch monthly interactive campaigns',
        ],
        timeline: '3 months',
        metrics: ['Engagement Rate', 'Response Time', 'Community Size', 'Interaction Depth'],
      },
    };
    
    if (goalMap[primaryGoal]) {
      goalMilestones.push(goalMap[primaryGoal]);
    }
  }

  return {
    dashboardWidgets,
    contentSuggestions,
    quickActions,
    recommendedTemplates,
    brandVoiceGuidelines,
    toneRecommendations: extractToneRecommendations(brandVoiceDescription),
    goalMilestones,
  };
}

function generateInfluencerWorkspace(data: Partial<InfluencerFormData>): PersonalizedWorkspaceConfig {
  const { niche, primaryGoal, contentStyle, primaryPlatforms, followerCount } = data;

  // Dashboard widgets for creators
  const dashboardWidgets = [
    'content-calendar',
    'post-performance',
    'audience-insights',
  ];

  if (primaryPlatforms?.includes('Instagram') || primaryPlatforms?.includes('TikTok')) {
    dashboardWidgets.push('reel-analytics', 'trending-sounds');
  }

  if (followerCount && ['10k-50k', '50k-100k', '100k-500k', '500k+'].includes(followerCount)) {
    dashboardWidgets.push('sponsorship-tracker', 'collaboration-manager');
  }

  // Content suggestions
  const contentSuggestions: ContentSuggestion[] = [];

  if (niche) {
    contentSuggestions.push({
      id: 'niche-expertise',
      title: `${niche} Deep Dive Series`,
      description: 'Establish yourself as an expert in your niche',
      type: 'series',
      platforms: Array.isArray(primaryPlatforms) ? primaryPlatforms : (primaryPlatforms ? [primaryPlatforms] : ['Instagram', 'YouTube']),
      priority: 'high',
    });
  }

  if (primaryGoal === 'grow-audience') {
    contentSuggestions.push({
      id: 'viral-hooks',
      title: 'Trending Format Experiments',
      description: 'Try viral content formats in your niche',
      type: 'post',
      platforms: Array.isArray(primaryPlatforms) ? primaryPlatforms : (primaryPlatforms ? [primaryPlatforms] : ['TikTok', 'Instagram']),
      priority: 'high',
    });
  }

  if (contentStyle?.toLowerCase().includes('educational')) {
    contentSuggestions.push({
      id: 'tutorial-series',
      title: 'Step-by-Step Tutorial Series',
      description: 'Break down complex topics for your audience',
      type: 'series',
      platforms: Array.isArray(primaryPlatforms) ? primaryPlatforms : (primaryPlatforms ? [primaryPlatforms] : ['YouTube', 'Instagram']),
      priority: 'medium',
    });
  }

  contentSuggestions.push({
    id: 'behind-scenes',
    title: 'Behind-the-Scenes Content',
    description: 'Share your creative process with followers',
    type: 'post',
    platforms: Array.isArray(primaryPlatforms) ? primaryPlatforms : (primaryPlatforms ? [primaryPlatforms] : ['Instagram Stories', 'TikTok']),
    priority: 'medium',
  });

  // Quick actions for creators
  const quickActions: QuickAction[] = [
    {
      id: 'plan-content',
      label: 'Plan Content',
      icon: 'layout-grid',
      action: '/content/planner',
      description: 'Organize your content calendar',
    },
    {
      id: 'generate-captions',
      label: 'Generate Captions',
      icon: 'sparkles',
      action: '/generate/captions',
      description: 'AI-powered caption ideas',
    },
    {
      id: 'track-collabs',
      label: 'Manage Collabs',
      icon: 'users',
      action: '/collaborations',
      description: 'Track brand partnerships',
    },
  ];

  // Creator templates
  const recommendedTemplates: Template[] = [
    {
      id: 'reel-script',
      name: 'Viral Reel Script',
      category: 'Short-Form',
      description: 'Hook-based reel structure',
      useCase: 'Instagram Reels, TikTok videos',
    },
    {
      id: 'carousel-post',
      name: 'Educational Carousel',
      category: 'Educational',
      description: 'Multi-slide storytelling format',
      useCase: 'Instagram carousels, LinkedIn posts',
    },
    {
      id: 'youtube-outline',
      name: 'YouTube Video Outline',
      category: 'Long-Form',
      description: 'Structured video script template',
      useCase: 'YouTube videos, long-form content',
    },
  ];

  // Content style guidelines
  const brandVoiceGuidelines: BrandVoiceGuideline[] = [];
  
  if (contentStyle) {
    brandVoiceGuidelines.push({
      aspect: 'Content Style',
      guideline: `Maintain ${contentStyle} approach`,
      examples: [
        'Stay authentic to your personal brand',
        'Use your natural speaking voice',
        'Share personal stories and experiences',
      ],
    });
  }

  // Goal milestones
  const goalMilestones: GoalMilestone[] = [];
  
  if (primaryGoal) {
    const creatorGoalMap: Record<string, GoalMilestone> = {
      'grow-audience': {
        goal: 'Grow Your Audience',
        milestones: [
          'Post consistently (3-5x per week)',
          'Gain 1,000 new followers',
          'Achieve 5% engagement rate',
          'Collaborate with 2-3 creators',
        ],
        timeline: '2 months',
        metrics: ['Follower Growth', 'Engagement Rate', 'Reach', 'Save Rate'],
      },
      'monetize-content': {
        goal: 'Monetize Your Content',
        milestones: [
          'Reach monetization requirements',
          'Pitch to 10 brands',
          'Secure first paid partnership',
          'Create media kit',
        ],
        timeline: '3 months',
        metrics: ['Partnership Revenue', 'Brand Inquiries', 'CPM Rate', 'Sponsorship Deals'],
      },
      'build-community': {
        goal: 'Build Engaged Community',
        milestones: [
          'Reply to all comments',
          'Start weekly Q&A sessions',
          'Create exclusive content for fans',
          'Launch community challenge',
        ],
        timeline: '2 months',
        metrics: ['Comment Rate', 'DM Volume', 'Story Replies', 'Community Participation'],
      },
    };
    
    if (creatorGoalMap[primaryGoal]) {
      goalMilestones.push(creatorGoalMap[primaryGoal]);
    }
  }

  return {
    dashboardWidgets,
    contentSuggestions,
    quickActions,
    recommendedTemplates,
    brandVoiceGuidelines,
    toneRecommendations: contentStyle ? [contentStyle] : [],
    goalMilestones,
  };
}

function extractToneRecommendations(brandVoice?: string): string[] {
  if (!brandVoice) return [];
  
  const recommendations: string[] = [];
  const voiceLower = brandVoice.toLowerCase();
  
  const toneMap: Record<string, string> = {
    professional: 'Use formal language and industry terminology',
    friendly: 'Be warm, conversational, and approachable',
    casual: 'Keep it relaxed with everyday language',
    authoritative: 'Demonstrate expertise with confidence',
    playful: 'Use humor and lighthearted language',
    empathetic: 'Show understanding and emotional connection',
    inspirational: 'Motivate and uplift your audience',
  };
  
  for (const [tone, rec] of Object.entries(toneMap)) {
    if (voiceLower.includes(tone)) {
      recommendations.push(rec);
    }
  }
  
  return recommendations;
}

/**
 * Save personalized workspace config to user preferences
 */
export async function saveWorkspaceConfig(
  userId: string,
  config: PersonalizedWorkspaceConfig
): Promise<void> {
  try {
    // Save to localStorage for client-side access
    if (typeof window !== 'undefined') {
      localStorage.setItem('workspace-config', JSON.stringify(config));
      localStorage.setItem('workspace-config-timestamp', new Date().toISOString());
    }

    // Also send to API for validation
    const response = await fetch('/api/workspace/personalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, config }),
    });

    if (!response.ok) {
      throw new Error('Failed to save workspace configuration');
    }
  } catch (error) {
    console.error('Error saving workspace config:', error);
    // Don't throw - localStorage save is more important
  }
}

/**
 * Get saved workspace config from localStorage
 */
export function getWorkspaceConfig(): PersonalizedWorkspaceConfig | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const configStr = localStorage.getItem('workspace-config');
    if (!configStr) return null;
    
    return JSON.parse(configStr) as PersonalizedWorkspaceConfig;
  } catch (error) {
    console.error('Error reading workspace config:', error);
    return null;
  }
}
