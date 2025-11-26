import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withGet, withPost } from '@/lib/api-middleware'

const bodySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5).optional(),
  category: z.string().min(2),
  structure: z.record(z.any()).optional(),
})

type ApiContext = {
  user?: { id: string }
}

async function handleGet(_request: NextRequest, context: ApiContext) {
  const { user } = context
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const templates = await prisma.contentTemplate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ templates })
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

  const { title, description, category, structure } = parsed.data

  const template = await prisma.contentTemplate.create({
    data: {
      userId: user.id,
      title,
      description,
      category,
      structure: structure ?? {},
      metadata: { source: 'manual-entry' },
    },
  })

  return NextResponse.json({ template }, { status: 201 })
}

export const GET = withGet(handleGet, { requireAuth: true })
export const POST = withPost(handlePost, { requireAuth: true })
