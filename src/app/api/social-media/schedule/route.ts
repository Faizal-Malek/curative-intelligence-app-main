import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ContentIdeaStatus, PostStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { withPost } from '@/lib/api-middleware'

const bodySchema = z.object({
  ideaId: z.string().uuid().optional(),
  caption: z.string().min(10).optional(),
  platform: z.string().min(2),
  scheduledAt: z.union([z.string().datetime(), z.date()]),
  mediaUrl: z.string().url().optional(),
})

type ApiContext = {
  user?: { id: string }
  body?: z.infer<typeof bodySchema>
}

async function handler(_request: Request, context: ApiContext) {
  const { user, body } = context
  if (!user || !body) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const scheduledAt = body.scheduledAt instanceof Date
    ? body.scheduledAt
    : new Date(body.scheduledAt)

  const idea = body.ideaId
    ? await prisma.contentIdea.findFirst({ where: { id: body.ideaId, userId: user.id } })
    : null

  if (body.ideaId && !idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
  }

  const caption = body.caption ?? idea?.content ?? ''

  if (!caption) {
    return NextResponse.json({ error: 'Caption is required when no idea content is provided.' }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      userId: user.id,
      content: caption,
      caption,
      platform: body.platform.toLowerCase(),
      status: PostStatus.READY_TO_SCHEDULE,
      scheduledAt,
      mediaUrl: body.mediaUrl,
      metadata: {
        source: 'vault-scheduler',
        ideaId: idea?.id,
      },
    },
  })

  if (idea) {
    await prisma.contentIdea.update({
      where: { id: idea.id },
      data: { status: ContentIdeaStatus.SCHEDULED },
    })
  }

  return NextResponse.json({ post })
}

export const POST = withPost(handler, {
  requireAuth: true,
  validateBody: bodySchema,
})
