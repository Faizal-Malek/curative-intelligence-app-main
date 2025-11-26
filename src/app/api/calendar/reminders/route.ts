import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSupabaseUserFromCookies } from '@/lib/supabase'
import { ensureUserBySupabase, extractProfileFromSupabaseUser } from '@/lib/user-supabase'
import { reminderSchema } from '@/lib/validations/calendar'

export async function GET() {
  const su = await getSupabaseUserFromCookies()
  if (!su) return new NextResponse('Unauthorized', { status: 401 })
  const items = await prisma.reminder.findMany({
    where: { userId: su.id },
    orderBy: { startsAt: 'asc' },
  })
  return NextResponse.json({ reminders: items })
}

export async function POST(req: Request) {
  try {
    const su = await getSupabaseUserFromCookies()
    if (!su) return new NextResponse('Unauthorized', { status: 401 })
    
    const user = await ensureUserBySupabase(
      su.id,
      su.email ?? null,
      extractProfileFromSupabaseUser(su)
    )
    if (!user) return new NextResponse('User not found', { status: 404 })
    
    const body = await req.json()
    const parsed = reminderSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ errors: parsed.error.format() }, { status: 400 })
    const data = parsed.data
    const created = await prisma.reminder.create({
      data: {
        userId: user.id,
        title: data.title,
        description: data.description ?? null,
        startsAt: data.startsAt,
        endsAt: data.endsAt ?? null,
        allDay: data.allDay ?? false,
      },
    })
    return NextResponse.json({ reminder: created })
  } catch (e) {
    console.error('[POST /api/calendar/reminders] Error:', e)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
