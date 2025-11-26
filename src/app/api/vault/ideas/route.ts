import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ContentIdeaStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { withGet, withPost } from '@/lib/api-middleware'

const querySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(ContentIdeaStatus).optional(),
})

const metadataSchema = z.object({
  templateId: z.string().min(1).optional(),
})

const bodySchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  tags: z.array(z.string()).optional().default([]),
  status: z.nativeEnum(ContentIdeaStatus).optional(),
  metadata: metadataSchema.optional(),
})

type ApiContext = {
  user?: {
    id: string
    email: string | null
  }
  searchParams?: URLSearchParams
}

async function handleGet(_request: NextRequest, context: ApiContext) {
  const { user, searchParams } = context
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsed = querySchema.safeParse(Object.fromEntries(searchParams?.entries() ?? []))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  }

  try {
    const { search, status } = parsed.data
    const where: Parameters<typeof prisma.contentIdea.findMany>[0]['where'] = {
      userId: user.id,
    }

    if (status) {
      where.status = status
    }

    if (search) {
      const term = search.trim()
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { content: { contains: term, mode: 'insensitive' } },
        { tags: { has: term } },
      ]
    }

    const ideas = await prisma.contentIdea.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ideas })
  } catch (error) {
    // If ContentIdea table doesn't exist yet, return empty array
    if (error instanceof Error && error.message.includes('ContentIdea')) {
      console.warn('ContentIdea table not found - returning empty array. Run COMPLETE_DATABASE_MIGRATION.sql to create it.')
      return NextResponse.json({ ideas: [] })
    }
    throw error
  }
}

async function handlePost(request: NextRequest, context: ApiContext) {
  const { user } = context
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const { title, content, tags, status, metadata: metadataPayload } = parsed.data
    const templateMetadata = metadataPayload ?? {}
    const metadata = {
      ...templateMetadata,
      source: templateMetadata.templateId ? 'template' : 'manual-entry',
    }

    const idea = await prisma.contentIdea.create({
      data: {
        userId: user.id,
        title,
        content,
        tags: tags ?? [],
        status: status ?? ContentIdeaStatus.DRAFT,
        metadata,
      },
    })

    return NextResponse.json({ idea }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.includes('ContentIdea')) {
      return NextResponse.json(
        { error: 'ContentIdea table not found. Please run COMPLETE_DATABASE_MIGRATION.sql in Supabase.' },
        { status: 503 }
      )
    }
    throw error
  }
}

export const GET = withGet(handleGet, {
  requireAuth: true,
  logRequest: true,
})

export const POST = withPost(handlePost, {
  requireAuth: true,
  logRequest: true,
})
