'use client'

import { useEffect, useMemo, useState } from 'react'

type EventItem = {
  id: string
  type: 'post' | 'reminder'
  title: string
  description?: string
  start: string | Date
  end?: string | Date
  allDay?: boolean
  status?: string
}

function startOfWeek(d: Date) {
  const t = new Date(d)
  t.setDate(t.getDate() - t.getDay())
  t.setHours(0, 0, 0, 0)
  return t
}
function endOfWeek(d: Date) {
  const t = startOfWeek(d)
  t.setDate(t.getDate() + 6)
  t.setHours(23, 59, 59, 999)
  return t
}

export default function CalendarWeekPage() {
  const [cursor, setCursor] = useState(new Date())
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(false)
  const range = useMemo(() => ({ start: startOfWeek(cursor), end: endOfWeek(cursor) }), [cursor])

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ start: range.start.toISOString(), end: range.end.toISOString() })
      const res = await fetch(`/api/calendar/events?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load events')
      const json = await res.json()
      setEvents(json.events ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.start, range.end])

  async function editReminderTitle(ev: EventItem) {
    if (ev.type !== 'reminder') return
    const next = window.prompt('Edit reminder title', ev.title)
    if (!next || next.trim() === ev.title) return
    await fetch(`/api/calendar/reminders/${ev.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: next.trim() }),
    })
    await load()
  }

  const days = useMemo(() => {
    const arr: Date[] = []
    const s = startOfWeek(cursor)
    for (let i = 0; i < 7; i++) arr.push(new Date(s.getFullYear(), s.getMonth(), s.getDate() + i))
    return arr
  }, [cursor])

  const eventsByDayHour = useMemo(() => {
    const map = new Map<string, EventItem[]>()
    for (const ev of events) {
      const d = new Date(ev.start)
      const key = `${d.toISOString().slice(0, 10)}-${d.getHours()}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ev)
    }
    return map
  }, [events])

  const weekLabel = `${range.start.toLocaleDateString()} — ${range.end.toLocaleDateString()}`

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xl font-semibold text-[#3A2F2F]">Week: {weekLabel}</div>
        <div className="space-x-2">
          <button className="rounded-md border border-white/30 bg-white/20 px-3 py-1 text-sm text-[#3A2F2F] hover:bg-white/30" onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth(), c.getDate() - 7))}>Prev</button>
          <button className="rounded-md border border-white/30 bg-white/20 px-3 py-1 text-sm text-[#3A2F2F] hover:bg-white/30" onClick={() => setCursor(new Date())}>Today</button>
          <button className="rounded-md border border-white/30 bg-white/20 px-3 py-1 text-sm text-[#3A2F2F] hover:bg-white/30" onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth(), c.getDate() + 7))}>Next</button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-2">
        <div />
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
          <div key={d} className="px-2 py-1 text-xs font-medium text-[#7A6F6F]">{d}</div>
        ))}
        {Array.from({ length: 24 }, (_, hour) => (
          <>
            <div key={`h-${hour}`} className="text-xs text-[#7A6F6F]">{hour}:00</div>
            {days.map((day) => {
              const key = `${day.toISOString().slice(0, 10)}-${hour}`
              const items = eventsByDayHour.get(key) ?? []
              return (
                <div key={key} className="min-h-10 rounded border border-white/20 bg-white/10 p-1">
                  {items.map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => editReminderTitle(ev)}
                      className={`mb-1 w-full truncate rounded px-2 py-1 text-left text-[10px] ${ev.type === 'post' ? 'bg-[#D2B193]/40 cursor-default' : 'bg-[#EFE8D8]/60 hover:bg-[#EFE8D8]/80'}`}
                      title={ev.type === 'reminder' ? 'Click to edit' : (ev.description || ev.title) as string}
                    >
                      {ev.title}
                    </button>
                  ))}
                </div>
              )
            })}
          </>
        ))}
      </div>

      {loading && <div className="mt-4 text-xs text-[#7A6F6F]">Loading…</div>}
    </div>
  )
}
