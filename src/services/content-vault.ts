import { ContentIdeaStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/monitoring'

interface GenerateVaultOptions {
  batchId?: string
}

const AUTO_SOURCE = 'auto-ai-generator'

type BrandProfileSummary = {
  brandName: string
  industry: string
  brandDescription: string
  brandVoiceDescription: string
  primaryGoal: string
}

type TemplateSeed = {
  title: string
  description: string
  category: string
  structure: Record<string, unknown>
}

type IdeaSeed = {
  title: string
  content: string
  tags: string[]
  status: ContentIdeaStatus
  metadata: Prisma.JsonObject
}

export async function generateVaultAssetsForUser(
  userId: string,
  options: GenerateVaultOptions = {}
) {
  const batchId = options.batchId

  const profile = await prisma.brandProfile.findUnique({
    where: { userId },
    select: {
      brandName: true,
      industry: true,
      brandDescription: true,
      brandVoiceDescription: true,
      primaryGoal: true,
    },
  })

  if (!profile) {
    logger.warn('No brand profile available for vault generation', { userId })
    return { ideas: [], templates: [] }
  }

  const ideaSeeds = buildIdeaSeeds(profile, batchId)
  const templateSeeds = buildTemplateSeeds(profile)

  const [ideas, templates] = await prisma.$transaction([
    prisma.contentIdea.createMany({
      data: ideaSeeds.map((seed) => ({
        userId,
        batchId,
        title: seed.title,
        content: seed.content,
        tags: seed.tags,
        status: seed.status,
        metadata: seed.metadata,
      })),
    }),
    prisma.contentTemplate.createMany({
      data: templateSeeds.map((seed) => ({
        userId,
        title: seed.title,
        description: seed.description,
        category: seed.category,
        structure: seed.structure,
        metadata: { source: AUTO_SOURCE },
      })),
    }),
  ])

  logger.info('Vault assets generated for user', {
    userId,
    ideaCount: ideaSeeds.length,
    templateCount: templateSeeds.length,
    batchId,
  })

  return { ideas, templates }
}

function buildIdeaSeeds(profile: BrandProfileSummary, batchId?: string): IdeaSeed[] {
  const tags = [profile.industry, profile.primaryGoal].filter(Boolean)
  const hero = profile.brandName
  const tone = profile.brandVoiceDescription || 'polished'

  return [
    {
      title: `${hero} weekly momentum check-in`,
      content: `Film a short update explaining how ${hero} is moving the needle on ${profile.primaryGoal.toLowerCase()}. Use ${tone} language and finish with a forward-looking CTA.`,
      tags,
      status: ContentIdeaStatus.READY,
      metadata: { source: AUTO_SOURCE, batchId },
    },
    {
      title: `${hero} behind-the-scenes carousel`,
      content: `Turn a recent project into a 5-frame carousel: hook, process visual, lessons learned, metric spotlight, invite followers to react. Keep it rooted in ${profile.brandDescription.toLowerCase()}.`,
      tags,
      status: ContentIdeaStatus.DRAFT,
      metadata: { source: AUTO_SOURCE, batchId },
    },
    {
      title: `${hero} community spotlight`,
      content: `Highlight a customer or partner win related to ${profile.industry.toLowerCase()}. Pair a quote with a stat and end with an invitation to collaborate.`,
      tags,
      status: ContentIdeaStatus.READY,
      metadata: { source: AUTO_SOURCE, batchId },
    },
  ]
}

function buildTemplateSeeds(profile: BrandProfileSummary): TemplateSeed[] {
  return [
    {
      title: 'Impact Carousel Blueprint',
      description: `Template tailored for ${profile.brandName} to recap wins with a premium editorial tone.`,
      category: 'Social',
      structure: {
        slides: [
          { label: 'Hook', prompt: 'Lead with tension or bold stat' },
          { label: 'Process', prompt: 'Show how the team tackles the challenge' },
          { label: 'Result', prompt: 'Quantify impact tied to primary goal' },
          { label: 'CTA', prompt: 'Invite followers to take the next step' },
        ],
      },
    },
    {
      title: 'Executive Update Script',
      description: '60-second teleprompter-ready script for founders to deliver momentum updates.',
      category: 'Video',
      structure: {
        beats: [
          'Opening hook referencing latest milestone',
          'Core narrative with supporting metric',
          'Customer/community highlight',
          'Forward-looking close + CTA',
        ],
      },
    },
  ]
}
