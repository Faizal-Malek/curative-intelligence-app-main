// AI Workspace Generator Service
// Generates personalized workspace content based on user profile and onboarding data

interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: string;
  plan: string;
  brandProfile?: any;
  influencerProfile?: any;
}

interface OnboardingData {
  userType: 'business' | 'influencer';
  primaryGoal?: string;
  brandName?: string;
  industry?: string;
  brandVoice?: string[];
  contentTone?: string;
  targetAudience?: string;
  platforms?: string[];
  contentStyle?: string[];
  niche?: string;
  audienceSize?: string;
}

interface ContentIdea {
  platform: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  category: string;
  tone: string;
  goalAlignment: string;
}

interface ContentTemplate {
  id: string;
  name: string;
  description: string;
  structure: string;
  useCases: string[];
  tone: string;
  platform: string;
}

interface WorkspaceContent {
  contentIdeas: ContentIdea[];
  templates: ContentTemplate[];
  dashboardLayout: any;
  recommendedSchedule: any;
  contentPillars: string[];
}

/**
 * Generate personalized workspace content using AI
 */
export async function generateWorkspaceContent(
  user: UserProfile,
  onboardingData: OnboardingData
): Promise<WorkspaceContent> {
  // Build comprehensive prompt from user data
  const prompt = buildWorkspacePrompt(user, onboardingData);

  // Call AI service (OpenAI, Anthropic, or local model)
  const aiResponse = await callAIService(prompt, onboardingData);

  // Parse and structure the AI response
  return parseAIResponse(aiResponse, onboardingData);
}

/**
 * Build detailed prompt for AI workspace generation with structured template
 */
function buildWorkspacePrompt(user: UserProfile, data: OnboardingData): string {
  const isInfluencer = data.userType === 'influencer';
  const name = user.firstName || 'User';
  const goal = data.primaryGoal || 'brand_awareness';

  // Build comprehensive profile context
  const profileContext = buildProfileContext(user, data, isInfluencer);
  
  // Build goal-specific requirements
  const goalRequirements = buildGoalRequirements(goal);
  
  // Build output specifications
  const outputSpecs = buildOutputSpecifications(data, isInfluencer);

  // Assemble the complete prompt
  const prompt = `# ROLE & CONTEXT
You are an elite content strategist and social media expert with 10+ years of experience. You specialize in creating data-driven, conversion-focused content strategies for ${isInfluencer ? 'content creators and influencers' : 'brands and businesses'}.

Your task is to create a highly personalized workspace setup for ${name}, ensuring every piece of content aligns with their unique profile, goals, and audience.

---

# CLIENT PROFILE
${profileContext}

---

# PRIMARY OBJECTIVE
${goalRequirements}

---

# OUTPUT REQUIREMENTS
${outputSpecs}

---

# QUALITY STANDARDS
✓ Every content idea MUST align with the primary goal: "${goal}"
✓ Captions must be ${data.contentTone || 'engaging'}, ${data.brandVoice?.join(', ') || 'professional'}, and ${isInfluencer ? 'authentic to their personal brand' : 'on-brand'}
✓ Hashtags must be a mix of: high-volume (100k-1M posts), medium (10k-100k), and niche-specific (under 10k)
✓ Templates must be actionable and immediately usable
✓ Avoid generic advice - be specific to their ${isInfluencer ? 'niche' : 'industry'}
✓ Consider platform algorithms and best practices for ${data.platforms?.join(', ') || 'Instagram'}

---

# RESPONSE FORMAT
Return ONLY valid JSON (no markdown, no explanations) with this exact structure:

{
  "contentIdeas": [
    {
      "platform": "instagram",
      "caption": "Full caption text here (100-150 words, engaging hook, value-driven body, clear CTA)",
      "hashtags": ["hashtag1", "hashtag2", "...15-20 hashtags"],
      "mentions": [],
      "category": "Content category",
      "tone": "${data.contentTone || 'engaging'}",
      "goalAlignment": "${goal}",
      "reasoning": "Brief explanation why this content achieves the goal"
    }
    // ... 4 more content ideas (total 5)
  ],
  "templates": [
    {
      "id": "unique-id",
      "name": "Template Name",
      "description": "What this template achieves",
      "structure": "Detailed step-by-step format with [PLACEHOLDERS]",
      "useCases": ["Use case 1", "Use case 2", "Use case 3"],
      "tone": "Recommended tone",
      "platform": "Best platform",
      "example": "Brief example showing template in action"
    }
    // ... 2 more templates (total 3)
  ],
  "contentPillars": [
    "Pillar 1 - Brief explanation why this matters for their goal",
    "Pillar 2 - Brief explanation why this matters for their goal",
    "Pillar 3 - Brief explanation why this matters for their goal"
    // 3-5 pillars total
  ],
  "postingSchedule": {
    "frequency": "X posts per week",
    "bestTimes": {
      "${data.platforms?.[0] || 'instagram'}": ["time1", "time2"],
      "${data.platforms?.[1] || 'facebook'}": ["time1", "time2"]
    },
    "contentMix": {
      "educational": "40%",
      "entertaining": "30%",
      "promotional": "20%",
      "engagement": "10%"
    },
    "weeklyPlan": {
      "monday": "Content type + reasoning",
      "wednesday": "Content type + reasoning",
      "friday": "Content type + reasoning"
    },
    "reasoning": "Why this schedule optimizes for ${goal}"
  },
  "dashboardMetrics": [
    "Metric 1 - Why it matters for ${goal}",
    "Metric 2 - Why it matters for ${goal}",
    "Metric 3 - Why it matters for ${goal}"
    // 5-7 metrics
  ]
}

CRITICAL: Your response must be valid JSON that can be parsed by JSON.parse(). Double-check all quotes, commas, and brackets.`;

  return prompt;
}

/**
 * Build detailed profile context section
 */
function buildProfileContext(user: UserProfile, data: OnboardingData, isInfluencer: boolean): string {
  if (isInfluencer) {
    return `
**Creator Type:** ${data.niche || 'Content Creator'}
**Content Style:** ${data.contentStyle?.join(', ') || 'Varied'}
**Primary Platforms:** ${data.platforms?.join(', ') || 'Instagram'}
**Current Audience Size:** ${data.audienceSize || 'Growing audience'}
**Target Audience:** ${data.targetAudience || 'General audience'}
**Content Tone:** ${data.contentTone || 'Authentic and relatable'}
**Unique Value Proposition:** ${data.niche ? `Expert in ${data.niche}` : 'Multi-faceted creator'}

**Audience Pain Points & Desires:**
${data.targetAudience ? `This audience typically struggles with challenges in ${data.niche || 'their field'} and seeks ${data.contentStyle?.includes('educational') ? 'practical advice' : 'inspiration and entertainment'}.` : 'Understanding audience needs is crucial for content that resonates.'}`;
  } else {
    return `
**Business Name:** ${data.brandName || user.firstName || 'The Brand'}
**Industry/Sector:** ${data.industry || 'General Business'}
**Brand Voice Attributes:** ${data.brandVoice?.join(', ') || 'Professional, trustworthy'}
**Content Tone:** ${data.contentTone || 'Informative and engaging'}
**Target Market:** ${data.targetAudience || 'B2B/B2C market'}
**Primary Platforms:** ${data.platforms?.join(', ') || 'Instagram, LinkedIn'}
**Current Plan:** ${user.plan} (scale content sophistication accordingly)

**Brand Positioning:**
${data.industry ? `Operating in the ${data.industry} sector` : 'Established brand'} serving ${data.targetAudience || 'a diverse customer base'}. Brand voice emphasizes ${data.brandVoice?.slice(0, 2).join(' and ') || 'professionalism'}.

**Market Context:**
Competing in a ${data.industry ? `${data.industry} landscape` : 'competitive market'} where ${data.brandVoice?.includes('innovative') ? 'innovation' : 'trust'} is key to standing out.`;
  }
}

/**
 * Build goal-specific requirements
 */
function buildGoalRequirements(goal: string): string {
  const goalMap: Record<string, string> = {
    brand_awareness: `
**Goal:** Maximize Brand Awareness & Recognition

**Success Metrics:** Reach, Impressions, Profile Visits, Follower Growth, Share Rate
**Content Strategy:** Focus on brand story, behind-the-scenes, value-driven content, and shareable moments
**Key Outcome:** Make the brand memorable and recognizable. Every content piece should answer: "Why should people remember us?"

**Tactical Requirements:**
- Content must be highly shareable and visually striking
- Include brand story elements and personality
- Encourage profile visits through curiosity gaps
- Use trending formats adapted to brand voice`,

    community_engagement: `
**Goal:** Build an Active, Engaged Community

**Success Metrics:** Engagement Rate, Comments, Saves, Shares, Response Time, Community Growth
**Content Strategy:** Prioritize two-way conversations, user-generated content, interactive posts, and community spotlights
**Key Outcome:** Create superfans who actively participate. Every post should invite response.

**Tactical Requirements:**
- Every content idea must include a clear engagement trigger (question, poll, challenge)
- Foster sense of belonging and shared identity
- Encourage user-generated content and testimonials
- Create opportunities for community members to shine`,

    lead_generation: `
**Goal:** Generate Qualified Leads & Drive Conversions

**Success Metrics:** Link Clicks, Conversions, Lead Form Submissions, CTR, Cost Per Lead, ROI
**Content Strategy:** Value-first approach with clear CTAs, lead magnets, social proof, and trust-building
**Key Outcome:** Convert followers into leads. Every piece should have a conversion path.

**Tactical Requirements:**
- Include compelling lead magnets (free resources, templates, guides)
- Showcase results, case studies, and testimonials
- Create urgency with limited-time offers
- Clear, action-oriented CTAs in every post`,

    website_traffic: `
**Goal:** Drive Quality Traffic to Website/Landing Pages

**Success Metrics:** Link Clicks, Website Visits, Bounce Rate, Time on Site, Pages per Session, Conversion Rate
**Content Strategy:** Content teasers, exclusive web content, resource promotion, giveaways requiring site visit
**Key Outcome:** Make website the destination. Social is the appetizer, website is the main course.

**Tactical Requirements:**
- Create curiosity gaps that can only be satisfied on website
- Promote exclusive web content (blog posts, resources, tools)
- Use "link in bio" strategy effectively
- Track which content types drive highest quality traffic`,
  };

  return goalMap[goal] || goalMap.brand_awareness;
}

/**
 * Build output specifications
 */
function buildOutputSpecifications(data: OnboardingData, isInfluencer: boolean): string {
  return `
## 1. Content Ideas (5 required)

Each content idea must include:
- **Platform:** Optimized for ${data.platforms?.[0] || 'Instagram'}
- **Caption:** 100-150 words structured as:
  * Hook (first line grabs attention)
  * Value/Story (middle builds interest)
  * CTA (end drives action aligned with goal)
- **Hashtags:** 15-20 hashtags
  * 5 high-volume (100k-1M posts)
  * 8 medium-volume (10k-100k posts)  
  * 7 niche-specific (under 10k posts)
- **Category:** Type of content (e.g., "Behind-the-Scenes", "Tutorial", "User Testimonial")
- **Reasoning:** Brief explanation of how this achieves the primary goal

**Content Variety:** Ensure mix of formats:
- At least 1 educational/value post
- At least 1 engagement/community post
- At least 1 visual/storytelling post
- Remaining 2 should fill strategic gaps

## 2. Reusable Templates (3 required)

Each template must be:
- **Actionable:** User can fill in blanks and post immediately
- **Specific:** Tailored to ${isInfluencer ? data.niche : data.industry} (not generic)
- **Flexible:** Works for multiple use cases
- **Structured:** Clear format with [PLACEHOLDERS] marked
- **Goal-aligned:** Optimized for ${data.primaryGoal}

Include real example showing template in action.

## 3. Content Pillars (3-5 required)

Strategic themes that:
- Support the primary goal
- Can be sustained long-term
- Differentiate from competitors
- Resonate with ${data.targetAudience || 'target audience'}

Format: "Pillar Name - Why this matters for [goal]"

## 4. Posting Schedule

Provide:
- Optimal posting frequency for ${data.platforms?.join(' and ') || 'their platforms'}
- Best posting times based on platform algorithms
- Content type mix percentages
- Sample weekly plan with reasoning
- Explanation of why this schedule achieves the goal

## 5. Dashboard Metrics (5-7 required)

Priority metrics to track, each with:
- Metric name
- Why it matters for ${data.primaryGoal}
- What "success" looks like for this metric

Focus on actionable metrics over vanity metrics.`;
}

/**
 * Call AI service to generate content
 */
async function callAIService(prompt: string, data: OnboardingData): Promise<any> {
  // Check for OpenAI API key
  const openaiKey = process.env.OPENAI_API_KEY;

  if (openaiKey) {
    // Use OpenAI
    return await callOpenAI(prompt);
  }

  // Fallback to template-based generation if no AI service available
  console.warn('No AI service configured, using template-based generation');
  return generateTemplateBasedContent(data);
}

/**
 * Call OpenAI API
 */
async function callOpenAI(prompt: string): Promise<any> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content strategist and social media specialist. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error('No content returned from OpenAI');
  }

  return JSON.parse(content);
}

/**
 * Template-based content generation (fallback)
 */
function generateTemplateBasedContent(data: OnboardingData): any {
  const isInfluencer = data.userType === 'influencer';
  const goal = data.primaryGoal || 'brand_awareness';

  // Generate content ideas based on goal
  const contentIdeas = generateContentIdeasByGoal(goal, data);
  const templates = generateTemplatesByType(data.userType, data);
  const contentPillars = generateContentPillars(data);
  const postingSchedule = generatePostingSchedule(data);
  const dashboardMetrics = generateDashboardMetrics(goal);

  return {
    contentIdeas,
    templates,
    contentPillars,
    postingSchedule,
    dashboardMetrics,
  };
}

/**
 * Generate content ideas based on goal
 */
function generateContentIdeasByGoal(goal: string, data: OnboardingData): ContentIdea[] {
  const ideas: ContentIdea[] = [];
  const platform = data.platforms?.[0] || 'instagram';

  const goalTemplates = {
    brand_awareness: [
      {
        caption: `Introducing ${data.brandName || 'us'}! 🌟 We're on a mission to ${data.industry ? `transform the ${data.industry} industry` : 'make a difference'}. Our story started with a simple idea: creating value that matters. Swipe to learn more about what drives us every day. What's your biggest challenge in ${data.industry || 'this space'}? Let's connect! 👇`,
        category: 'Brand Introduction',
        hashtags: ['#BrandStory', '#MeetTheBrand', '#NewBeginnings', '#Innovation', '#Purpose'],
      },
      {
        caption: `Behind the scenes at ${data.brandName || 'our studio'}! 💡 Here's a sneak peek into how we bring ideas to life. Our team is passionate about ${data.industry || 'creating amazing experiences'}, and every detail matters. What would you like to see more of? Drop a comment below! ✨`,
        category: 'Behind The Scenes',
        hashtags: ['#BehindTheScenes', '#TeamWork', '#CreativeProcess', '#MakingMagic'],
      },
      {
        caption: `✨ Transformation Tuesday! Check out this amazing journey. From concept to reality, this is what ${data.brandName || 'we'} stand for. ${data.targetAudience ? `Helping ${data.targetAudience}` : 'Making an impact'} one step at a time. Which part resonates with you most? Share your thoughts! 💭`,
        category: 'Transformation',
        hashtags: ['#Transformation', '#BeforeAfter', '#Success', '#Impact', '#Growth'],
      },
      {
        caption: `🎯 Quick tip for ${data.targetAudience || 'everyone'}: Want to ${data.industry ? `excel in ${data.industry}` : 'achieve your goals'}? Start with this simple principle... [Share valuable insight here]. Save this post for later and tag someone who needs to see this! 🔖`,
        category: 'Value Tips',
        hashtags: ['#TipTuesday', '#ProTip', '#Knowledge', '#Learning', '#GrowthMindset'],
      },
      {
        caption: `💬 Let's talk! What's the one thing you wish you knew about ${data.industry || 'this industry'} when you started? We're building a community of ${data.targetAudience || 'like-minded individuals'}, and your insights matter. Drop your thoughts below - we read every single comment! 👇`,
        category: 'Community Engagement',
        hashtags: ['#Community', '#LetsTalk', '#Engagement', '#ShareYourStory', '#Connect'],
      },
    ],
    community_engagement: [
      {
        caption: `🗨️ Question of the day: If you could change one thing about ${data.industry || 'your daily routine'}, what would it be? We're genuinely curious about your experiences! Share your thoughts and let's start a conversation. 💭 PS: We reply to every comment!`,
        category: 'Q&A',
        hashtags: ['#CommunityFirst', '#LetsTalk', '#QuestionOfTheDay', '#Engagement'],
      },
      {
        caption: `🎉 Shoutout Saturday! This week we want to celebrate YOU. Tag someone in ${data.targetAudience || 'our community'} who inspires you, and tell us why! Let's spread some positivity together. The best story gets featured next week! ✨`,
        category: 'Community Spotlight',
        hashtags: ['#Community', '#Shoutout', '#Inspiration', '#Together', '#Gratitude'],
      },
      {
        caption: `🎮 Poll time! We need your input: Which content do you want to see more of? A) Behind-the-scenes B) Tips & tutorials C) Success stories D) Product updates Comment your choice below! Your feedback shapes what we create next. 🙌`,
        category: 'Interactive Poll',
        hashtags: ['#PollTime', '#YourVoiceMatters', '#Community', '#Feedback'],
      },
      {
        caption: `💪 Challenge accepted! Join our ${data.brandName || 'weekly'} challenge: [Insert relevant challenge]. Post your results, tag us, and use #${data.brandName || 'Our'}Challenge to be featured! Can't wait to see what you create. Who's in? 🙋‍♀️`,
        category: 'Challenge',
        hashtags: ['#Challenge', '#JoinUs', '#Community', '#Participate', '#Fun'],
      },
      {
        caption: `📸 User spotlight! Today we're featuring @[username] and their amazing work with ${data.industry || 'their passion'}. This is exactly what our community is about - supporting and celebrating each other! Want to be featured? Tag us in your posts! 🌟`,
        category: 'User Generated Content',
        hashtags: ['#UserSpotlight', '#Community', '#Featured', '#Inspiration', '#Grateful'],
      },
    ],
    lead_generation: [
      {
        caption: `🎁 Limited time offer! Get our free ${data.industry || 'industry'} guide that's helped 1000+ ${data.targetAudience || 'people'} achieve amazing results. Link in bio! 👆 This comprehensive resource covers: ✅ [Key benefit 1] ✅ [Key benefit 2] ✅ [Key benefit 3] Don't miss out - available for 48 hours only!`,
        category: 'Lead Magnet',
        hashtags: ['#FreeResource', '#LimitedOffer', '#Download', '#Guide', '#Value'],
      },
      {
        caption: `🚀 Case study alert! See how we helped [Client/User] achieve [specific result] in just [timeframe]. The secret? Our proven 3-step system: 1️⃣ [Step 1] 2️⃣ [Step 2] 3️⃣ [Step 3] Want similar results? DM us "READY" or click the link in bio to get started! `,
        category: 'Case Study',
        hashtags: ['#CaseStudy', '#Results', '#Success', '#ProvenSystem', '#Transformation'],
      },
      {
        caption: `⚡ Quick question: Are you struggling with [pain point]? You're not alone! We've created a free masterclass showing exactly how to [solve problem]. 📚 What you'll learn: • [Key takeaway 1] • [Key takeaway 2] • [Key takeaway 3] Register now - link in bio! Spots are limited. ⏰`,
        category: 'Webinar Promotion',
        hashtags: ['#FreeWebinar', '#Masterclass', '#Learn', '#Training', '#Register'],
      },
      {
        caption: `📊 REVEALED: The ${data.industry || 'industry'} secret that [achieves specific outcome]. After working with 500+ ${data.targetAudience || 'clients'}, we've discovered the one thing that makes the biggest difference... Want to know what it is? Comment "SECRET" below and we'll send you our detailed breakdown! 🔐`,
        category: 'Value Reveal',
        hashtags: ['#IndustrySecret', '#Revealed', '#ProTip', '#GameChanger', '#Expert'],
      },
      {
        caption: `🎯 Is this you? ❌ Feeling stuck with [problem] ❌ Wasting time on [inefficiency] ❌ Not seeing the [results] you want We've helped ${data.targetAudience || 'hundreds'} solve these exact challenges. Book a free 15-min consultation - link in bio! Let's see if we're a fit. 💼`,
        category: 'Consultation Offer',
        hashtags: ['#FreeConsultation', '#ProblemSolved', '#BookNow', '#NoObligations', '#LetsChat'],
      },
    ],
    website_traffic: [
      {
        caption: `🔥 New blog post alert! "The Ultimate Guide to [Topic]" is now live! 📖 Inside you'll discover: • [Key point 1] • [Key point 2] • [Key point 3] • Bonus: [Extra value] This is our most comprehensive guide yet! Tap the link in bio to read now. Bookmark for later! 🔖`,
        category: 'Blog Promotion',
        hashtags: ['#NewBlogPost', '#ReadNow', '#Ultimate Guide', '#MustRead', '#ContentAlert'],
      },
      {
        caption: `💡 Today's featured resource: [Resource Name]! Perfect for ${data.targetAudience || 'anyone'} looking to [achieve goal]. ⭐ What makes it special: ✓ [Feature 1] ✓ [Feature 2] ✓ [Feature 3] Available exclusively on our website. Link in bio to explore! Which feature excites you most? 👇`,
        category: 'Resource Highlight',
        hashtags: ['#Resources', '#Tools', '#MustHave', '#CheckItOut', '#Exclusive'],
      },
      {
        caption: `🎥 NEW VIDEO: Watch as we break down [topic] step-by-step. This 10-minute tutorial will change how you think about ${data.industry || 'this'}! 🎬 Chapters: 0:00 Intro 2:15 [Section 1] 5:30 [Section 2] 8:45 Recap Full video on our website - link in bio! Subscribe while you're there! 📺`,
        category: 'Video Content',
        hashtags: ['#NewVideo', '#Tutorial', '#WatchNow', '#StepByStep', '#Learn'],
      },
      {
        caption: `📱 JUST LAUNCHED: Our brand new ${data.brandName || 'platform'} experience! Explore: 🔹 [Feature 1] 🔹 [Feature 2] 🔹 [Feature 3] 🔹 [Feature 4] Everything you need in one place. Check it out now - link in bio! First 100 visitors get [bonus]. What feature do you want to try first? 👀`,
        category: 'Platform Launch',
        hashtags: ['#JustLaunched', '#NewExperience', '#CheckItOut', '#Innovation', '#Excited'],
      },
      {
        caption: `🎁 GIVEAWAY TIME! Win [prize] by entering on our website! How to enter: 1. Visit the link in bio 2. Fill out the quick form 3. Share with a friend (optional bonus entry!) Winner announced [date]! BONUS: Everyone who enters gets [incentive]. Good luck! 🍀`,
        category: 'Giveaway',
        hashtags: ['#Giveaway', '#Contest', '#Win', '#EnterNow', '#FreeStuff'],
      },
    ],
  };

  const selectedTemplates = goalTemplates[goal as keyof typeof goalTemplates] || goalTemplates.brand_awareness;

  return selectedTemplates.map((template, index) => ({
    platform,
    caption: template.caption,
    hashtags: template.hashtags,
    mentions: [],
    category: template.category,
    tone: data.contentTone || 'engaging',
    goalAlignment: goal,
  }));
}

/**
 * Generate reusable templates
 */
function generateTemplatesByType(userType: string, data: OnboardingData): ContentTemplate[] {
  const isInfluencer = userType === 'influencer';

  if (isInfluencer) {
    return [
      {
        id: 'influencer-story-template',
        name: 'Personal Story Post',
        description: 'Share authentic experiences that connect with your audience',
        structure: '[Hook] Personal story opening\n[Body] The challenge/experience\n[Insight] What you learned\n[CTA] Question or engagement prompt',
        useCases: ['Behind-the-scenes', 'Life updates', 'Lessons learned', 'Vulnerable moments'],
        tone: data.contentStyle?.includes('authentic') ? 'authentic' : 'relatable',
        platform: 'instagram',
      },
      {
        id: 'influencer-tutorial-template',
        name: 'Tutorial/How-To Post',
        description: 'Educational content that provides clear value',
        structure: '[Hook] Promise the outcome\n[Steps] Numbered or bulleted steps\n[Tip] Pro tip or bonus\n[CTA] Save/share prompt',
        useCases: ['Tutorials', 'Hacks', 'Tips & tricks', 'Product reviews'],
        tone: 'helpful',
        platform: 'instagram',
      },
      {
        id: 'influencer-engagement-template',
        name: 'Community Engagement Post',
        description: 'Build connection through conversation',
        structure: '[Question/Poll] Engaging question\n[Context] Why you\'re asking\n[Personal answer] Your perspective\n[CTA] Strong call to comment',
        useCases: ['Q&A', 'Polls', 'Discussions', 'Community building'],
        tone: 'conversational',
        platform: 'instagram',
      },
    ];
  } else {
    return [
      {
        id: 'business-value-template',
        name: 'Value-First Post',
        description: 'Provide immediate value to establish authority',
        structure: '[Hook] Bold statement or question\n[Value] 3-5 actionable tips\n[Context] Why this matters\n[CTA] Engage or learn more',
        useCases: ['Tips', 'Industry insights', 'Best practices', 'Thought leadership'],
        tone: data.brandVoice?.includes('educational') ? 'educational' : 'professional',
        platform: 'linkedin',
      },
      {
        id: 'business-social-proof-template',
        name: 'Social Proof Post',
        description: 'Leverage testimonials and results',
        structure: '[Hook] Customer result\n[Story] The transformation\n[Method] How you helped\n[CTA] Invitation to engage',
        useCases: ['Testimonials', 'Case studies', 'Success stories', 'Reviews'],
        tone: 'credible',
        platform: 'instagram',
      },
      {
        id: 'business-announcement-template',
        name: 'Announcement Post',
        description: 'Share news and updates professionally',
        structure: '[Announcement] What\'s new\n[Benefits] What this means for audience\n[Details] Key information\n[CTA] Next steps',
        useCases: ['Product launches', 'Updates', 'News', 'Events'],
        tone: 'exciting',
        platform: 'instagram',
      },
    ];
  }
}

/**
 * Generate content pillars
 */
function generateContentPillars(data: OnboardingData): string[] {
  const goal = data.primaryGoal || 'brand_awareness';
  const isInfluencer = data.userType === 'influencer';

  const pillarsByGoal: Record<string, string[]> = {
    brand_awareness: isInfluencer 
      ? ['Personal Stories', 'Day in the Life', 'Values & Mission', 'Behind the Scenes']
      : ['Brand Story', 'Company Culture', 'Industry Insights', 'Product Showcases'],
    community_engagement: isInfluencer
      ? ['Q&A Sessions', 'Community Spotlights', 'Interactive Content', 'User-Generated Content']
      : ['Customer Stories', 'Community Challenges', 'User Testimonials', 'Engagement Posts'],
    lead_generation: isInfluencer
      ? ['Expert Tips', 'Resource Sharing', 'Case Studies', 'Free Value']
      : ['Lead Magnets', 'Case Studies', 'Webinar Promotion', 'Free Resources'],
    website_traffic: isInfluencer
      ? ['Blog Content', 'Video Content', 'Exclusive Content', 'Resource Hubs']
      : ['Blog Promotion', 'Resource Library', 'Giveaways', 'Exclusive Offers'],
  };

  return pillarsByGoal[goal] || pillarsByGoal.brand_awareness;
}

/**
 * Generate posting schedule recommendation
 */
function generatePostingSchedule(data: OnboardingData): any {
  const platforms = data.platforms || ['instagram'];

  return {
    frequency: '4-5 posts per week',
    bestTimes: {
      instagram: ['9-11 AM', '7-9 PM'],
      facebook: ['1-3 PM', '7-9 PM'],
      twitter: ['8-10 AM', '6-9 PM'],
      linkedin: ['7-8 AM', '12 PM', '5-6 PM'],
    },
    contentMix: {
      educational: '40%',
      entertaining: '30%',
      promotional: '20%',
      engagement: '10%',
    },
    recommendation: `For ${platforms.join(' and ')}, we recommend posting ${platforms.includes('instagram') || platforms.includes('facebook') ? '4-5 times per week' : '3-4 times per week'}. Focus on ${data.primaryGoal === 'community_engagement' ? 'interactive content' : 'value-driven posts'} during peak engagement hours.`,
  };
}

/**
 * Generate dashboard metrics priorities
 */
function generateDashboardMetrics(goal: string): string[] {
  const metricsByGoal: Record<string, string[]> = {
    brand_awareness: ['Reach', 'Impressions', 'Profile Visits', 'Follower Growth', 'Share Rate'],
    community_engagement: ['Engagement Rate', 'Comments', 'Saves', 'Shares', 'Response Time'],
    lead_generation: ['Link Clicks', 'Conversions', 'Lead Form Submissions', 'CTR', 'ROI'],
    website_traffic: ['Link Clicks', 'Website Visits', 'Bounce Rate', 'Time on Site', 'Pages per Session'],
  };

  return metricsByGoal[goal] || metricsByGoal.brand_awareness;
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(aiResponse: any, data: OnboardingData): WorkspaceContent {
  return {
    contentIdeas: aiResponse.contentIdeas || [],
    templates: aiResponse.templates || generateTemplatesByType(data.userType, data),
    dashboardLayout: {
      priorityMetrics: aiResponse.dashboardMetrics || generateDashboardMetrics(data.primaryGoal || 'brand_awareness'),
      widgets: ['performance', 'schedule', 'ideas'],
    },
    recommendedSchedule: aiResponse.postingSchedule || generatePostingSchedule(data),
    contentPillars: aiResponse.contentPillars || generateContentPillars(data),
  };
}
