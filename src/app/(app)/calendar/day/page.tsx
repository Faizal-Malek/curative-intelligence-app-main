'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

type EventItem = {
  id: string
  type: 'post' | 'reminder' | 'event' | 'content-idea' | 'campaign' | 'meeting'
  title: string
  description?: string
  start: string | Date
  end?: string | Date
  allDay?: boolean
  status?: string
  category?: string
}

type CategoryFilter = 'all' | 'post' | 'reminder' | 'event' | 'content-idea' | 'campaign' | 'meeting'

const categoryOptions: { value: CategoryFilter; label: string; color: string }[] = [
  { value: 'all', label: 'All Items', color: 'bg-gray-100' },
  { value: 'post', label: 'Posts', color: 'bg-[#D2B193]/40' },
  { value: 'reminder', label: 'Reminders', color: 'bg-[#EFE8D8]/60' },
  { value: 'event', label: 'Events', color: 'bg-blue-100' },
  { value: 'content-idea', label: 'Content Ideas', color: 'bg-purple-100' },
  { value: 'campaign', label: 'Campaigns', color: 'bg-green-100' },
  { value: 'meeting', label: 'Meetings', color: 'bg-orange-100' },
]

function startOfDay(d: Date) {
  const t = new Date(d)
  t.setHours(0, 0, 0, 0)
  return t
}
function endOfDay(d: Date) {
  const t = new Date(d)
  t.setHours(23, 59, 59, 999)
  return t
}

export default function CalendarDayPage() {
  const [cursor, setCursor] = useState(new Date())
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const range = useMemo(() => ({ start: startOfDay(cursor), end: endOfDay(cursor) }), [cursor])

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const itemsByHour = useMemo(() => {
    const filteredEvents = selectedCategory === 'all' 
      ? events 
      : events.filter(ev => ev.type === selectedCategory)
    
    const map = new Map<number, EventItem[]>()
    for (const ev of filteredEvents) {
      const d = new Date(ev.start)
      const h = d.getHours()
      if (!map.has(h)) map.set(h, [])
      map.get(h)!.push(ev)
    }
    return map
  }, [events, selectedCategory])

  const dayLabel = range.start.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
  const selectedCategoryOption = categoryOptions.find(opt => opt.value === selectedCategory)

  const getEventColor = (event: EventItem) => {
    const categoryOption = categoryOptions.find(opt => opt.value === event.type)
    return categoryOption?.color || 'bg-gray-100'
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-xl font-semibold text-[#3A2F2F]">Day: {dayLabel}</div>
          
          {/* Category Filter Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-[#EFE8D8] bg-white/90 px-3 py-2 text-sm text-[#3A2F2F] hover:bg-white/95 focus:outline-none focus:ring-2 focus:ring-[#D2B193]/50"
            >
              <div className={`w-3 h-3 rounded-full ${selectedCategoryOption?.color}`}></div>
              <span>{selectedCategoryOption?.label}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-[#EFE8D8] bg-white/95 backdrop-blur-sm shadow-lg z-10">
                <div className="py-1">
                  {categoryOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedCategory(option.value)
                        setDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-[#EFE8D8]/50 ${
                        selectedCategory === option.value ? 'bg-[#EFE8D8]/30' : ''
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                      <span className="text-[#3A2F2F]">{option.label}</span>
                      {selectedCategory === option.value && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-[#D2B193]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-x-2">
          <button className="rounded-md border border-white/30 bg-white/20 px-3 py-1 text-sm text-[#3A2F2F] hover:bg-white/30" onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth(), c.getDate() - 1))}>Prev</button>
          <button className="rounded-md border border-white/30 bg-white/20 px-3 py-1 text-sm text-[#3A2F2F] hover:bg-white/30" onClick={() => setCursor(new Date())}>Today</button>
          <button className="rounded-md border border-white/30 bg-white/20 px-3 py-1 text-sm text-[#3A2F2F] hover:bg-white/30" onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth(), c.getDate() + 1))}>Next</button>
        </div>
      </div>

      <div className="grid grid-cols-[80px_1fr] gap-2">
        {Array.from({ length: 24 }, (_, hour) => (
          <>
            <div key={`h-${hour}`} className="text-xs text-[#7A6F6F]">{hour}:00</div>
            <div key={`c-${hour}`} className="min-h-12 rounded border border-white/20 bg-white/10 p-2">
              {(itemsByHour.get(hour) ?? []).map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={async () => {
                    if (ev.type !== 'reminder') return
                    const next = window.prompt('Edit reminder title', ev.title)
                    if (!next || next.trim() === ev.title) return
                    await fetch(`/api/calendar/reminders/${ev.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: next.trim() }),
                    })
                    await load()
                  }}
                  className={`mb-1 w-full rounded px-2 py-1 text-left text-xs transition-colors ${getEventColor(ev)} ${ev.type === 'post' ? 'cursor-default' : 'hover:opacity-80'}`}
                >
                  <div className="font-medium truncate">{ev.title}</div>
                  {ev.description && <div className="text-[10px] opacity-80 truncate">{ev.description}</div>}
                </button>
              ))}
            </div>
          </>
        ))}
      </div>

      {loading && <div className="mt-4 text-xs text-[#7A6F6F]">Loading…</div>}
    </div>
  )
}
