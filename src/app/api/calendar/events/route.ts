// GET /api/calendar/events?start=ISO&end=ISO
// Returns user's scheduled posts and reminders between start..end
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSupabaseUserFromCookies } from '@/lib/supabase'
import { ensureUserBySupabase, extractProfileFromSupabaseUser } from '@/lib/user-supabase'

function parseRange(searchParams: URLSearchParams) {
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  if (!start || !end) return null
  const s = new Date(start)
  const e = new Date(end)
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return null
  return { start: s, end: e }
}

export async function GET(req: Request) {
  try {
    console.log('[API /calendar/events] Request received')
    
    const su = await getSupabaseUserFromCookies()
    if (!su) {
      console.log('[API /calendar/events] No authenticated user found')
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    const user = await ensureUserBySupabase(
      su.id,
      su.email ?? null,
      extractProfileFromSupabaseUser(su)
    )
    if (!user) {
      console.log('[API /calendar/events] User not found in database')
      return new NextResponse('User not found', { status: 404 })
    }
    
    console.log('[API /calendar/events] User authenticated:', user.id)

    const { searchParams } = new URL(req.url)
    const range = parseRange(searchParams)
    if (!range) {
      console.log('[API /calendar/events] Invalid range parameters')
      return new NextResponse('Missing or invalid start/end', { status: 400 })
    }
    
    console.log('[API /calendar/events] Date range:', range)

    // Query scheduled posts in range
    console.log('[API /calendar/events] Querying posts...')
    let posts: Array<{ id: string; content: string | null; scheduledAt: Date | null; status: string }> = []
    try {
      posts = await prisma.post.findMany({
        where: {
          userId: user.id,
          scheduledAt: { gte: range.start, lte: range.end },
        },
        select: {
          id: true,
          content: true,
          scheduledAt: true,
          status: true,
        },
        orderBy: { scheduledAt: 'asc' },
      })
    } catch (error: any) {
      console.log('[API /calendar/events] Post table missing columns, skipping posts:', error.message)
      posts = [] // Gracefully handle missing columns
    }
    console.log('[API /calendar/events] Found posts:', posts.length)

    // Query reminders in range
    console.log('[API /calendar/events] Querying reminders...')
    const reminders = await prisma.reminder.findMany({
      where: {
        userId: user.id,
        // event overlaps range if startsAt <= range.end AND (endsAt is null OR endsAt >= range.start)
        AND: [
          { startsAt: { lte: range.end } },
          { OR: [{ endsAt: null }, { endsAt: { gte: range.start } }] },
        ],
      },
      orderBy: { startsAt: 'asc' },
    })
    console.log('[API /calendar/events] Found reminders:', reminders.length)

    // Normalize to a unified event shape
    const events = [
      ...posts.map((p) => ({
        id: p.id,
        type: 'post' as const,
        title: (p.content || '').slice(0, 40) + ((p.content || '').length > 40 ? '…' : ''),
        description: p.content,
        start: p.scheduledAt,
        end: p.scheduledAt,
        status: p.status,
      })),
      ...reminders.map((r) => ({
        id: r.id,
        type: 'reminder' as const,
        title: r.title,
        description: r.description ?? '',
        start: r.startsAt,
        end: r.endsAt ?? r.startsAt,
        allDay: r.allDay,
      })),
    ]

    console.log('[API /calendar/events] Returning events:', events.length)
    return NextResponse.json({ events })
  } catch (error) {
    console.error('[API /calendar/events] Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
