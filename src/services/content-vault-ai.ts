import { ContentIdeaStatus, Prisma } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/monitoring';

type IdeaPayload = {
  title: string;
  content: string;
  tags?: string[];
  status?: ContentIdeaStatus | string;
  provider?: string;
};

type TemplatePayload = {
  title: string;
  description?: string;
  category: string;
  structure?: Record<string, unknown>;
  provider?: string;
};

type GenerationOptions = {
  ideaLimit?: number;
  templateLimit?: number;
};

type GenerationResult = {
  addedIdeas: number;
  addedTemplates: number;
  skippedIdeas: number;
  skippedTemplates: number;
};

const DEFAULT_IDEA_LIMIT = 6;
const DEFAULT_TEMPLATE_LIMIT = 3;

const normalizeTitle = (title?: string | null) => (title ?? '').trim().toLowerCase();

const isValidStatus = (status?: string): status is ContentIdeaStatus =>
  status === ContentIdeaStatus.DRAFT ||
  status === ContentIdeaStatus.READY ||
  status === ContentIdeaStatus.SCHEDULED ||
  status === ContentIdeaStatus.ARCHIVED;

function buildPrompt({
  brandName,
  industry,
  brandDescription,
  brandVoiceDescription,
  primaryGoal,
  ideaLimit,
  templateLimit,
  existingIdeaTitles,
  existingTemplateTitles,
}: {
  brandName: string;
  industry: string;
  brandDescription: string;
  brandVoiceDescription: string;
  primaryGoal: string;
  ideaLimit: number;
  templateLimit: number;
  existingIdeaTitles: string[];
  existingTemplateTitles: string[];
}) {
  return [
    'You are an elite content strategist generating JSON only. Do not include markdown or fences.',
    'Create fresh social content ideas and reusable templates tailored to this brand.',
    `Brand: ${brandName || 'Unknown brand'} (${industry || 'General'})`,
    `Description: ${brandDescription || 'N/A'}`,
    `Voice: ${brandVoiceDescription || 'Confident, concise'}`,
    `Primary goal: ${primaryGoal || 'brand awareness'}`,
    `Existing idea titles (avoid duplicates, case-insensitive): ${existingIdeaTitles.join('; ') || 'none'}`,
    `Existing template titles (avoid duplicates): ${existingTemplateTitles.join('; ') || 'none'}`,
    `Return JSON with two keys: "ideas" (max ${ideaLimit}) and "templates" (max ${templateLimit}).`,
    `Idea shape: { "title": string, "content": string (150-220 words draft caption/script), "tags": [string], "status": "READY" | "DRAFT" }.`,
    'Template shape: { "title": string, "description": string, "category": string, "structure": object with outline/sections }.',
    'Keep titles unique and specific. Ensure no idea or template title repeats any existing title. Prefer short, strong tags (3-6).',
  ].join('\n');
}

async function callOpenAI(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ideas: [] as IdeaPayload[], templates: [] as TemplatePayload[] };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a concise content strategist. Respond only with valid JSON following the requested schema.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.65,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI returned no content');
  }

  const parsed = JSON.parse(content);
  const ideas = (parsed.ideas || []) as IdeaPayload[];
  const templates = (parsed.templates || []) as TemplatePayload[];
  return {
    ideas: ideas.map((idea) => ({ ...idea, provider: 'openai' })),
    templates: templates.map((tpl) => ({ ...tpl, provider: 'openai' })),
  };
}

async function callGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('[Gemini] API Key present:', !!apiKey);
  if (!apiKey) {
    console.warn('[Gemini] No API key configured, skipping');
    return { ideas: [] as IdeaPayload[], templates: [] as TemplatePayload[] };
  }

  console.log('[Gemini] Initializing API...');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
  });

  console.log('[Gemini] Sending prompt...');
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  console.log('[Gemini] Raw response length:', text.length);
  console.log('[Gemini] Raw response preview:', text.substring(0, 500));
  
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  console.log('[Gemini] Cleaned response preview:', cleaned.substring(0, 500));
  
  const parsed = JSON.parse(cleaned);
  const ideas = (parsed.ideas || []) as IdeaPayload[];
  const templates = (parsed.templates || []) as TemplatePayload[];
  console.log('[Gemini] Parsed ideas count:', ideas.length);
  console.log('[Gemini] Parsed templates count:', templates.length);
  
  return {
    ideas: ideas.map((idea) => ({ ...idea, provider: 'gemini' })),
    templates: templates.map((tpl) => ({ ...tpl, provider: 'gemini' })),
  };
}

function sanitizeIdeas(raw: IdeaPayload[], seen: Set<string>, limit: number) {
  const result: IdeaPayload[] = [];

  for (const idea of raw) {
    const key = normalizeTitle(idea.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push({
      title: idea.title?.trim() || 'Untitled idea',
      content: idea.content?.trim() || '',
      tags: (idea.tags || []).slice(0, 6).filter(Boolean),
      status: isValidStatus(idea.status) ? idea.status : ContentIdeaStatus.DRAFT,
      provider: idea.provider,
    });
    if (result.length >= limit) break;
  }

  return result;
}

function sanitizeTemplates(raw: TemplatePayload[], seen: Set<string>, limit: number) {
  const result: TemplatePayload[] = [];

  for (const tpl of raw) {
    const key = normalizeTitle(tpl.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push({
      title: tpl.title?.trim() || 'Untitled template',
      description: tpl.description?.trim() || '',
      category: tpl.category?.trim() || 'General',
      structure: tpl.structure || {},
      provider: tpl.provider,
    });
    if (result.length >= limit) break;
  }

  return result;
}

export async function generateAiVaultContent(userId: string, options: GenerationOptions = {}): Promise<GenerationResult> {
  console.log('[AI Service] Starting generation for user:', userId);
  const ideaLimit = options.ideaLimit ?? DEFAULT_IDEA_LIMIT;
  const templateLimit = options.templateLimit ?? DEFAULT_TEMPLATE_LIMIT;
  console.log('[AI Service] Limits - Ideas:', ideaLimit, 'Templates:', templateLimit);

  const profile = await prisma.brandProfile.findUnique({
    where: { userId },
    select: {
      brandName: true,
      industry: true,
      brandDescription: true,
      brandVoiceDescription: true,
      primaryGoal: true,
    },
  });

  if (!profile) {
    console.error('[AI Service] No brand profile found for user:', userId);
    throw new Error('Brand profile not found. Complete onboarding to generate content.');
  }
  
  console.log('[AI Service] Brand profile:', { brandName: profile.brandName, industry: profile.industry });

  const existingIdeas = await prisma.contentIdea.findMany({
    where: { userId },
    select: { title: true },
  });
  const existingTemplates = await prisma.contentTemplate.findMany({
    where: { userId },
    select: { title: true },
  });

  const ideaSeen = new Set(existingIdeas.map((i) => normalizeTitle(i.title)));
  const templateSeen = new Set(existingTemplates.map((t) => normalizeTitle(t.title)));

  const prompt = buildPrompt({
    brandName: profile.brandName || '',
    industry: profile.industry || '',
    brandDescription: profile.brandDescription || '',
    brandVoiceDescription: profile.brandVoiceDescription || '',
    primaryGoal: profile.primaryGoal || '',
    ideaLimit,
    templateLimit,
    existingIdeaTitles: Array.from(ideaSeen),
    existingTemplateTitles: Array.from(templateSeen),
  });

  let providerIdeas: IdeaPayload[] = [];
  let providerTemplates: TemplatePayload[] = [];

  try {
    const [openaiResult, geminiResult] = await Promise.all([
      callOpenAI(prompt).catch((err) => {
        logger.warn('OpenAI generation failed', { userId, error: (err as Error).message });
        return { ideas: [] as IdeaPayload[], templates: [] as TemplatePayload[] };
      }),
      callGemini(prompt).catch((err) => {
        logger.warn('Gemini generation failed', { userId, error: (err as Error).message });
        return { ideas: [] as IdeaPayload[], templates: [] as TemplatePayload[] };
      }),
    ]);

    providerIdeas = [...openaiResult.ideas, ...geminiResult.ideas];
    providerTemplates = [...openaiResult.templates, ...geminiResult.templates];
  } catch (err) {
    logger.error('AI generation failed', { userId, error: (err as Error).message });
  }

  console.log('[AI Service] Provider ideas before dedup:', providerIdeas.length);
  console.log('[AI Service] Provider templates before dedup:', providerTemplates.length);
  
  let dedupedIdeas = sanitizeIdeas(providerIdeas, ideaSeen, ideaLimit);
  let dedupedTemplates = sanitizeTemplates(providerTemplates, templateSeen, templateLimit);

  // If AI returned nothing usable, backfill with safe defaults so the vault is never empty.
  if (dedupedIdeas.length === 0) {
    logger.warn('AI returned no ideas; applying fallback seeds', { userId });
    const fallback = [
      {
        title: `${profile.brandName || 'Your brand'} momentum update`,
        content: `Share a concise update on how ${profile.brandName || 'the team'} is moving toward ${
          profile.primaryGoal || 'your key goal'
        }. Include one metric, one lesson, and a CTA.`,
        tags: [profile.primaryGoal || 'goal', profile.industry || 'industry', 'update'],
        status: ContentIdeaStatus.READY,
        provider: 'fallback',
      },
      {
        title: `${profile.brandName || 'Brand'} customer spotlight`,
        content: `Highlight a customer win relevant to ${profile.industry || 'your audience'}. Include quote, metric, and invitation to connect.`,
        tags: ['customer', 'spotlight', profile.industry || 'market'],
        status: ContentIdeaStatus.DRAFT,
        provider: 'fallback',
      },
    ] satisfies IdeaPayload[];
    dedupedIdeas = sanitizeIdeas(fallback, ideaSeen, ideaLimit);
  }

  if (dedupedTemplates.length === 0) {
    logger.warn('AI returned no templates; applying fallback seeds', { userId });
    const fallbackTemplates: TemplatePayload[] = [
      {
        title: `${profile.brandName || 'Brand'} Results Carousel`,
        description: '5-slide template to recap a recent win with hook, challenge, action, result, and CTA.',
        category: 'Social',
        structure: {
          slides: ['Hook', 'Challenge', 'Action', 'Result metric', 'CTA'],
        },
        provider: 'fallback',
      },
    ];
    dedupedTemplates = sanitizeTemplates(fallbackTemplates, templateSeen, templateLimit);
  }

  console.log('[AI Service] Deduped ideas:', dedupedIdeas.length);
  console.log('[AI Service] Deduped templates:', dedupedTemplates.length);

  if (dedupedIdeas.length > 0) {
    console.log('[AI Service] Creating', dedupedIdeas.length, 'ideas in database...');
    await prisma.contentIdea.createMany({
      data: dedupedIdeas.map((idea) => ({
        userId,
        title: idea.title,
        content: idea.content,
        tags: idea.tags ?? [],
        status: (idea.status ?? ContentIdeaStatus.DRAFT) as ContentIdeaStatus,
        metadata: {
          source: 'ai',
          provider: idea.provider || 'unknown',
        } as Prisma.JsonObject,
      })),
      skipDuplicates: false,
    });
  }

  if (dedupedTemplates.length > 0) {
    await prisma.contentTemplate.createMany({
      data: dedupedTemplates.map((tpl) => ({
        userId,
        title: tpl.title,
        description: tpl.description ?? '',
        category: tpl.category,
        structure: (tpl.structure ?? {}) as Prisma.InputJsonValue,
        metadata: {
          source: 'ai',
          provider: tpl.provider || 'unknown',
        } as Prisma.JsonObject,
      })),
      skipDuplicates: false,
    });
  }

  return {
    addedIdeas: dedupedIdeas.length,
    addedTemplates: dedupedTemplates.length,
    skippedIdeas: Math.max(providerIdeas.length - dedupedIdeas.length, 0),
    skippedTemplates: Math.max(providerTemplates.length - dedupedTemplates.length, 0),
  };
}
