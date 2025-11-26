import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ContentIdeaStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { withDelete, withPatch } from '@/lib/api-middleware'

const paramsSchema = z.object({
  id: z.string().uuid(),
})

const bodySchema = z.object({
  title: z.string().min(3).optional(),
  content: z.string().min(10).optional(),
  tags: z.array(z.string()).optional(),
  status: z.nativeEnum(ContentIdeaStatus).optional(),
})

type ApiContext = {
  user?: {
    id: string
  }
  params?: Record<string, string | string[] | undefined>
}

async function ensureOwnership(id: string, userId: string) {
  const idea = await prisma.contentIdea.findUnique({ where: { id } })
  if (!idea || idea.userId !== userId) {
    return null
  }
  return idea
}

function normalizeParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0]
  }
  return value
}

async function handleDelete(_request: Request, context: ApiContext) {
  const { user, params } = context
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsedParams = paramsSchema.safeParse({ id: normalizeParam(params?.id) })
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Invalid idea id' }, { status: 400 })
  }

  const { id } = parsedParams.data
  const idea = await ensureOwnership(id, user.id)
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
  }

  await prisma.contentIdea.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

async function handlePatch(request: Request, context: ApiContext) {
  const { user, params } = context
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const parsedParams = paramsSchema.safeParse({ id: normalizeParam(params?.id) })
  if (!parsedParams.success) {
    return NextResponse.json({ error: 'Invalid idea id' }, { status: 400 })
  }

  const body = await request.json()
  const parsedBody = bodySchema.safeParse(body)
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.flatten() }, { status: 400 })
  }

  const { id } = parsedParams.data
  const idea = await ensureOwnership(id, user.id)
  if (!idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
  }

  const updateData = parsedBody.data
  const updated = await prisma.contentIdea.update({
    where: { id },
    data: {
      title: updateData.title ?? idea.title,
      content: updateData.content ?? idea.content,
      tags: updateData.tags ?? idea.tags,
      status: updateData.status ?? idea.status,
    },
  })

  return NextResponse.json({ idea: updated })
}

export const DELETE = withDelete(handleDelete, {
  requireAuth: true,
})

export const PATCH = withPatch(handlePatch, {
  requireAuth: true,
})
