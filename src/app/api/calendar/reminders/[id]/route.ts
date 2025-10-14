import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSupabaseUserFromCookies } from '@/lib/supabase'
import { ensureUserBySupabase } from '@/lib/user-supabase'

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().nullable().optional(),
  allDay: z.boolean().optional(),
})

type ReminderRouteParams = Promise<{ id: string | string[] | undefined }>

const resolveReminderId = async (params: ReminderRouteParams) => {
  const { id } = await params
  return Array.isArray(id) ? id[0] : id
}

export async function GET(_req: Request, { params }: { params: ReminderRouteParams }) {
  const id = await resolveReminderId(params)
  if (!id) return new NextResponse('Invalid reminder id', { status: 400 })
  const su = await getSupabaseUserFromCookies()
  if (!su) return new NextResponse('Unauthorized', { status: 401 })
  
  const user = await ensureUserBySupabase(su.id, su.email ?? null)
  if (!user) return new NextResponse('User not found', { status: 404 })
  
  const item = await prisma.reminder.findFirst({ where: { id, userId: user.id } })
  if (!item) return new NextResponse('Not Found', { status: 404 })
  return NextResponse.json({ reminder: item })
}

export async function PUT(req: Request, { params }: { params: ReminderRouteParams }) {
  try {
    const id = await resolveReminderId(params)
    if (!id) return new NextResponse('Invalid reminder id', { status: 400 })
    const su = await getSupabaseUserFromCookies()
    if (!su) return new NextResponse('Unauthorized', { status: 401 })
    
    const user = await ensureUserBySupabase(su.id, su.email ?? null)
    if (!user) return new NextResponse('User not found', { status: 404 })
    
    const body = await req.json()
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    const data = parsed.data
    // Use updateMany with filter for ownership check
    const r = await prisma.reminder.updateMany({ where: { id, userId: user.id }, data })
    if (r.count === 0) return new NextResponse('Not Found', { status: 404 })
    const item = await prisma.reminder.findFirst({ where: { id, userId: user.id } })
    return NextResponse.json({ reminder: item })
  } catch (e) {
    console.error('[PUT /api/calendar/reminders/[id]] Error:', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: ReminderRouteParams }) {
  try {
    const id = await resolveReminderId(params)
    if (!id) return new NextResponse('Invalid reminder id', { status: 400 })
    const su = await getSupabaseUserFromCookies()
    if (!su) return new NextResponse('Unauthorized', { status: 401 })
    
    const user = await ensureUserBySupabase(su.id, su.email ?? null)
    if (!user) return new NextResponse('User not found', { status: 404 })
    
    const r = await prisma.reminder.deleteMany({ where: { id, userId: user.id } })
    if (r.count === 0) return new NextResponse('Not Found', { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[DELETE /api/calendar/reminders/[id]] Error:', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
