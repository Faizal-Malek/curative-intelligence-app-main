'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Plus, ChevronLeft, ChevronRight, Clock, Calendar, LayoutDashboard, Boxes, BarChart3, Settings as SettingsIconLucide, ChevronRight as ChevronRightIcon, ChevronLeft as ChevronLeftIcon, ChevronDown, ChevronUp, FileText, Bell, Target, CalendarCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import UserMenu from '@/components/auth/UserMenu'

// Simple Skeleton component
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse rounded-md bg-white/30 ${className || ''}`}
    {...props}
  />
)

// Navigation icon components (lucide)
const DashboardIconNew = () => <LayoutDashboard className="h-4 w-4" />;
const CalendarIconNew = () => <CalendarDays className="h-4 w-4" />;
const VaultIconNew = () => <Boxes className="h-4 w-4" />;
const AnalyticsIconNew = () => <BarChart3 className="h-4 w-4" />;
const SettingsIconNew = () => <SettingsIconLucide className="h-4 w-4" />;

// Calendar submenu icons
const PostsIcon = () => <FileText className="h-4 w-4" />;
const RemindersIcon = () => <Bell className="h-4 w-4" />;
const GoalsIcon = () => <Target className="h-4 w-4" />;
const EventsIcon = () => <CalendarCheck className="h-4 w-4" />;

// Category options for reminders
const categoryOptions = [
  { value: 'reminder', label: 'Reminder', color: 'bg-[#EFE8D8]/60' },
  { value: 'post', label: 'Post', color: 'bg-[#D2B193]/40' },
  { value: 'event', label: 'Event', color: 'bg-blue-100' },
  { value: 'content-idea', label: 'Content Idea', color: 'bg-purple-100' },
  { value: 'campaign', label: 'Campaign', color: 'bg-green-100' },
  { value: 'meeting', label: 'Meeting', color: 'bg-orange-100' },
];

// Reusable NavLink for the sidebar
const NavLink = ({ href, icon, children, isActive = false, onClick }: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  isActive?: boolean;
  onClick?: () => void;
}) => (
  <a 
    href={href} 
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors duration-200 ${
      isActive 
        ? 'bg-white text-[#2D2424] border border-[#EFE8D8]' 
        : 'text-[#6B5E5E] hover:bg-white hover:text-[#2D2424] border border-transparent hover:border-[#EFE8D8]'
    }`}
  >
    {icon}
    <span className="font-medium">{children}</span>
  </a>
);

// Submenu link component
const SubNavLink = ({ href, icon, children, isActive = false }: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  isActive?: boolean;
}) => (
  <a 
    href={href}
    className={`flex items-center space-x-2 px-8 py-2 rounded-lg transition-colors duration-200 ${
      isActive 
        ? 'bg-white/60 text-[#2D2424]' 
        : 'text-[#6B5E5E] hover:bg-white/40 hover:text-[#2D2424]'
    }`}
  >
    {icon}
    <span className="text-sm">{children}</span>
  </a>
);

// Calendar navigation component
const CalendarNavigation = ({ sidebarOpen, calendarSubmenuOpen, setCalendarSubmenuOpen }: {
  sidebarOpen: boolean;
  calendarSubmenuOpen: boolean;
  setCalendarSubmenuOpen: (open: boolean) => void;
}) => {
  if (!sidebarOpen) {
    return (
      <a href="/calendar" className="flex justify-center p-3 rounded-xl bg-white text-[#2D2424] border border-[#EFE8D8]">
        <CalendarDays className="h-7 w-7" />
      </a>
    );
  }

  return (
    <div>
      <button
        onClick={() => setCalendarSubmenuOpen(!calendarSubmenuOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[#2D2424] bg-white border border-[#EFE8D8] transition-colors duration-200"
      >
        <div className="flex items-center space-x-3">
          <CalendarIconNew />
          <span className="font-medium">Calendar</span>
        </div>
        {calendarSubmenuOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {calendarSubmenuOpen && (
        <div className="mt-2 space-y-1 bg-white/30 rounded-lg p-2 border border-[#EFE8D8]/50">
          <SubNavLink href="/calendar/posts" icon={<PostsIcon />} isActive={false}>Posts</SubNavLink>
          <SubNavLink href="/calendar" icon={<RemindersIcon />} isActive={true}>Reminders</SubNavLink>
          <SubNavLink href="/calendar/goals" icon={<GoalsIcon />} isActive={false}>Goals</SubNavLink>
          <SubNavLink href="/calendar/events" icon={<EventsIcon />} isActive={false}>Events</SubNavLink>
        </div>
      )}
    </div>
  );
};

type EventItem = {
  id: string
  title: string
  start: string
  end?: string
  allDay?: boolean
  type: 'post' | 'reminder'
  description?: string
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export default function CalendarPage() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [events, setEvents] = useState<EventItem[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ title: '', description: '', date: new Date().toISOString().slice(0,10), time: '09:00', allDay: false, category: 'reminder' })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [calendarSubmenuOpen, setCalendarSubmenuOpen] = useState(true)
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().slice(0, 10))
  const [todaysEventsLoading, setTodaysEventsLoading] = useState(false)
  const [editingReminder, setEditingReminder] = useState<string | null>(null)
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ title: '', description: '', date: '', time: '', allDay: false, category: 'reminder' })
  
  const range = useMemo(() => ({ start: startOfMonth(cursor), end: endOfMonth(cursor) }), [cursor])

  // Get today's events with loading state
  const todaysEvents = useMemo(() => {
    const todayKey = selectedDay
    return events.filter(ev => {
      const evDate = new Date(ev.start).toISOString().slice(0, 10)
      return evDate === todayKey
    })
  }, [events, selectedDay])

  // Navigate to today and highlight
  const goToToday = () => {
    const today = new Date()
    setCursor(startOfMonth(today))
    setSelectedDay(today.toISOString().slice(0, 10))
  }

  // Navigate to previous day
  const prevDay = () => {
    const current = new Date(selectedDay)
    current.setDate(current.getDate() - 1)
    const newDay = current.toISOString().slice(0, 10)
    setSelectedDay(newDay)
    setCursor(startOfMonth(current))
  }

  // Navigate to next day
  const nextDay = () => {
    const current = new Date(selectedDay)
    current.setDate(current.getDate() + 1)
    const newDay = current.toISOString().slice(0, 10)
    setSelectedDay(newDay)
    setCursor(startOfMonth(current))
  }

  // Delete reminder function
  const deleteReminder = async (reminderId: string) => {
    try {
      const res = await fetch(`/api/calendar/reminders/${reminderId}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        // Reload events
        const params = new URLSearchParams({ start: range.start.toISOString(), end: range.end.toISOString() })
        const eventsRes = await fetch(`/api/calendar/events?${params.toString()}`)
        if (eventsRes.ok) {
          const json = await eventsRes.json()
          setEvents(json.events ?? [])
        }
      }
    } catch (error) {
      console.error('Failed to delete reminder:', error)
    }
    setReminderToDelete(null)
  }

  // Start editing reminder
  const startEditReminder = (reminderId: string) => {
    const reminder = events.find(e => e.id === reminderId)
    if (reminder) {
      const date = new Date(reminder.start)
      setEditForm({
        title: reminder.title,
        description: reminder.description || '',
        date: date.toISOString().slice(0, 10),
        time: reminder.allDay ? '09:00' : date.toTimeString().slice(0, 5),
        allDay: reminder.allDay ?? false,
        category: reminder.type || 'reminder'
      })
      setEditingReminder(reminderId)
    }
  }

  // Update reminder
  const updateReminder = async () => {
    if (!editingReminder) return
    
    try {
      const startDate = editForm.allDay 
        ? new Date(editForm.date + 'T00:00:00')
        : new Date(editForm.date + 'T' + editForm.time)
      
      const res = await fetch(`/api/calendar/reminders/${editingReminder}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description || null,
          startsAt: startDate.toISOString(),
          endsAt: null,
          allDay: editForm.allDay,
          category: editForm.category
        })
      })
      
      if (res.ok) {
        // Reload events
        const params = new URLSearchParams({ start: range.start.toISOString(), end: range.end.toISOString() })
        const eventsRes = await fetch(`/api/calendar/events?${params.toString()}`)
        if (eventsRes.ok) {
          const json = await eventsRes.json()
          setEvents(json.events ?? [])
        }
      }
    } catch (error) {
      console.error('Failed to update reminder:', error)
    }
    
    setEditingReminder(null)
  }

  // Load events for calendar view
  useEffect(() => {
    const loadEvents = async () => {
      setEventsLoading(true)
      try {
        const params = new URLSearchParams({ start: range.start.toISOString(), end: range.end.toISOString() })
        const res = await fetch(`/api/calendar/events?${params.toString()}`)
        if (!res.ok) throw new Error('Failed to load events')
        const json = await res.json()
        setEvents(json.events ?? [])
      } catch (e) {
        console.error(e)
        setEvents([])
      } finally {
        setEventsLoading(false)
      }
    }
    loadEvents()
  }, [range.start, range.end])

  // Load today's events separately when selected day changes
  useEffect(() => {
    if (selectedDay) {
      setTodaysEventsLoading(true)
      // Simulate loading delay for better UX
      const timer = setTimeout(() => {
        setTodaysEventsLoading(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [selectedDay])

  const weeks = useMemo(() => {
    const start = new Date(range.start)
    const end = new Date(range.end)
    // pad to week start (Sun)
    const padStart = start.getDay()
    const first = new Date(start)
    first.setDate(first.getDate() - padStart)
    const days: Date[] = []
    for (let d = new Date(first); d <= end || days.length % 7 !== 0; d = new Date(d.getTime() + 24 * 3600 * 1000)) {
      days.push(new Date(d))
    }
    const w: Date[][] = []
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7))
    return w
  }, [range.start, range.end])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventItem[]>()
    for (const ev of events) {
      const d = new Date(ev.start)
      const key = d.toISOString().slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(ev)
    }
    return map
  }, [events])

  function prevMonth() { setCursor((c) => addMonths(c, -1)) }
  function nextMonth() { setCursor((c) => addMonths(c, 1)) }

  const monthName = cursor.toLocaleString(undefined, { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-[#F7F4EE] font-montserrat text-[#2D2424] relative">
      <div className="flex h-screen">
        {/* Fixed Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-16'} bg-white/90 backdrop-blur border-r border-[#EFE8D8] flex flex-col justify-between fixed left-0 top-0 h-full z-30 transition-all duration-300`}>
          <div>
            <div className="px-6 py-6 flex items-center justify-between border-b border-[#EFE8D8]">
              {sidebarOpen ? (
                <>
                  <h1 className="text-2xl font-bold tracking-tight">Curative</h1>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-md hover:bg-[#EFE8D8]/50 transition-colors"
                  >
                    <ChevronLeftIcon className="h-5 w-5 text-[#D2B193]" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setSidebarOpen(true)}
                  className="p-1 rounded-md hover:bg-[#EFE8D8]/50 transition-colors mx-auto"
                >
                  <ChevronRightIcon className="h-5 w-5 text-[#D2B193]" />
                </button>
              )}
            </div>
            <nav className="space-y-1 p-4">
              {sidebarOpen ? (
                <>
                  <NavLink href="/dashboard" icon={<DashboardIconNew />}>Dashboard</NavLink>
                  <CalendarNavigation 
                    sidebarOpen={sidebarOpen} 
                    calendarSubmenuOpen={calendarSubmenuOpen} 
                    setCalendarSubmenuOpen={setCalendarSubmenuOpen} 
                  />
                  <NavLink href="/vault" icon={<VaultIconNew />}>Content Vault</NavLink>
                  <NavLink href="/analytics" icon={<AnalyticsIconNew />}>Analytics</NavLink>
                </>
              ) : (
                <div className="space-y-3">
                  <a href="/dashboard" className="flex justify-center p-3 rounded-xl text-[#6B5E5E] hover:bg-white hover:text-[#2D2424] transition-colors">
                    <LayoutDashboard className="h-7 w-7" />
                  </a>
                  <CalendarNavigation 
                    sidebarOpen={sidebarOpen} 
                    calendarSubmenuOpen={calendarSubmenuOpen} 
                    setCalendarSubmenuOpen={setCalendarSubmenuOpen} 
                  />
                  <a href="/vault" className="flex justify-center p-3 rounded-xl text-[#6B5E5E] hover:bg-white hover:text-[#2D2424] transition-colors">
                    <Boxes className="h-7 w-7" />
                  </a>
                  <a href="/analytics" className="flex justify-center p-3 rounded-xl text-[#6B5E5E] hover:bg-white hover:text-[#2D2424] transition-colors">
                    <BarChart3 className="h-7 w-7" />
                  </a>
                </div>
              )}
            </nav>
          </div>
          <div className="p-4 border-t border-[#EFE8D8]">
            {sidebarOpen ? (
              <NavLink href="/settings" icon={<SettingsIconNew />}>Settings</NavLink>
            ) : (
              <a href="/settings" className="flex justify-center p-3 rounded-xl text-[#6B5E5E] hover:bg-white hover:text-[#2D2424] transition-colors">
                <SettingsIconLucide className="h-7 w-7" />
              </a>
            )}
          </div>
        </aside>

        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-16'} min-h-screen overflow-y-auto`}>
          <header className="bg-white/60 backdrop-blur-sm border-b border-[#EFE8D8] sticky top-0 z-20">
            <div className="px-6">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
                  <span className="text-sm text-[#7A6F6F] hidden md:inline">Schedule and manage your content</span>
                </div>
                <UserMenu />
              </div>
            </div>
          </header>

          <main className="container mx-auto px-6 py-8">
            {/* Today's Posts Summary - Compact horizontal card */}
            <Card variant="glass" className="mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-lg">Today&apos;s Summary</CardTitle>
                      <div className="text-sm text-[#7A6F6F]">
                        {new Date(selectedDay).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={prevDay}
                      className="p-1 h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={goToToday}
                      className="text-xs px-3 h-8"
                    >
                      Today
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={nextDay}
                      className="p-1 h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {todaysEventsLoading ? (
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-24 rounded-lg" />
                    <Skeleton className="h-12 w-32 rounded-lg" />
                    <Skeleton className="h-12 w-28 rounded-lg" />
                  </div>
                ) : todaysEvents.length === 0 ? (
                  <div className="flex items-center justify-between py-4">
                    <div className="text-[#7A6F6F] text-sm">No events for this day</div>
                    <Button
                      onClick={() => setShowAddModal(true)}
                      variant="secondary"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Reminder
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {todaysEvents.slice(0, 4).map((event) => {
                      const time = event.allDay ? 'All day' : new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div key={event.id} className="p-3 rounded-lg bg-white/50 border border-[#EFE8D8] hover:bg-white/70 transition-colors group">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-[#3A2F2F] mb-1 truncate">{event.title}</div>
                              <div className="text-xs text-[#7A6F6F] flex items-center gap-1">
                                <Clock className="h-3 w-3 flex-shrink-0" />
                                <span>{time}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${event.type === 'post' ? 'bg-[#D2B193]' : 'bg-[#EFE8D8]'}`}></div>
                              {event.type === 'reminder' && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => startEditReminder(event.id)}
                                  >
                                    <FileText className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-red-100"
                                    onClick={() => setReminderToDelete(event.id)}
                                  >
                                    <Plus className="h-3 w-3 rotate-45" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          {event.description && (
                            <div className="text-xs text-[#7A6F6F] line-clamp-1">{event.description}</div>
                          )}
                        </div>
                      )
                    })}
                    {todaysEvents.length > 4 && (
                      <div className="p-3 rounded-lg border border-[#EFE8D8] bg-[#EFE8D8]/30 flex items-center justify-center">
                        <span className="text-sm text-[#7A6F6F]">+{todaysEvents.length - 4} more</span>
                      </div>
                    )}
                    <div className="p-3 rounded-lg border border-dashed border-[#EFE8D8] flex items-center justify-center">
                      <Button
                        onClick={() => setShowAddModal(true)}
                        variant="secondary"
                        size="sm"
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar Header - Now the main full-width card */}
            <Card className="mb-6" variant="glass" isInteractive>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-floreal">{monthName}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={prevMonth}
                      className="p-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={goToToday}
                    >
                      Month
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={nextMonth}
                      className="p-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>



            {/* Calendar Grid */}
            <Card variant="glass">
              <CardContent className="p-6">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => (
                    <div key={day} className="px-3 py-2 text-center text-sm font-semibold text-[#7A6F6F] bg-[#EFE8D8]/30 rounded-lg">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-2">
                  {eventsLoading ? (
                    // Show skeleton loading for calendar days
                    [...Array(35)].map((_, idx) => (
                      <div key={idx} className="min-h-32 rounded-lg border border-[#EFE8D8] p-3">
                        <Skeleton className="h-4 w-6 mb-2" />
                        <div className="space-y-1">
                          {Math.random() > 0.5 && <Skeleton className="h-6 w-full rounded" />}
                          {Math.random() > 0.7 && <Skeleton className="h-6 w-full rounded" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    weeks.flat().map((day, idx) => {
                      const inMonth = day.getMonth() === cursor.getMonth()
                      const key = day.toISOString().slice(0,10)
                      const dayEvents = eventsByDay.get(key) ?? []
                      const isToday = key === new Date().toISOString().slice(0,10)
                      const isSelected = key === selectedDay
                      
                      return (
                        <div 
                          key={idx} 
                          onClick={() => inMonth && setSelectedDay(key)}
                          className={`min-h-32 rounded-lg border p-3 transition-all hover:shadow-md ${
                            inMonth 
                              ? `cursor-pointer ${
                                  isSelected
                                    ? 'border-[#D2B193] bg-[#D2B193]/20 ring-2 ring-[#D2B193]/30' 
                                    : isToday 
                                      ? 'border-[#D2B193] bg-[#D2B193]/10' 
                                      : 'border-[#EFE8D8] bg-white/30 hover:bg-white/50'
                                }`
                              : 'border-[#EFE8D8]/50 bg-white/10 opacity-50 cursor-not-allowed'
                          }`}
                        >
                          <div className={`mb-2 text-sm font-medium ${
                            isSelected ? 'text-[#D2B193] font-bold' : isToday ? 'text-[#D2B193] font-bold' : 'text-[#3A2F2F]'
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0,3).map((ev) => {
                              const dt = new Date(ev.start)
                              const time = ev.allDay ? 'All-day' : dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              return (
                                <div 
                                  key={ev.id} 
                                  className={`rounded-md px-2 py-1 text-xs border cursor-pointer hover:shadow-sm transition-all ${
                                    ev.type === 'post' 
                                      ? 'bg-[#D2B193]/40 border-[#D2B193]/60 text-[#3A2F2F]' 
                                      : 'bg-[#EFE8D8]/40 border-[#EFE8D8]/60 text-[#3A2F2F]'
                                  }`}
                                  title={`${ev.title} - ${time}`}
                                >
                                  <div className="font-medium truncate">{ev.title}</div>
                                  <div className="text-[10px] opacity-70">{time}</div>
                                </div>
                              )
                            })}
                            {dayEvents.length > 3 && (
                              <div className="text-[10px] text-[#7A6F6F] bg-white/40 rounded px-2 py-1">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      {/* Edit Reminder Modal */}
      {editingReminder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card variant="glass" className="max-w-md mx-4 w-full">
            <CardHeader>
              <CardTitle className='text-white'>Edit Reminder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-mediummb-2 block text-white">Title</label>
                <Input className='text-white'
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Reminder title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block text-white">Description</label>
                <Textarea className='text-white'
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-white mb-2 block">Category</label>
                <div className="relative">
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/90 border border-[#EFE8D8] rounded-lg text-[#3A2F2F] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/50 focus:border-[#D2B193] appearance-none cursor-pointer"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#7A6F6F] pointer-events-none" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${categoryOptions.find(opt => opt.value === editForm.category)?.color}`}></div>
                  <span className="text-xs text-gray-400">Selected category color</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Date</label>
                  <Input 
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Time</label>
                  <Input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                    disabled={editForm.allDay}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-all-day"
                  checked={editForm.allDay}
                  onChange={(e) => setEditForm(prev => ({ ...prev, allDay: e.target.checked }))}
                  className="rounded border-[#EFE8D8]"
                />
                <label htmlFor="edit-all-day" className="text-sm text-white">All day event</label>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setEditingReminder(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={updateReminder}
                  disabled={!editForm.title.trim()}
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card variant="glass" className="max-w-md mx-4 w-full">
            <CardHeader>
              <CardTitle className='text-white'>Add Reminder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Title</label>
                <Input
                  value={addForm.title}
                  onChange={(e) => setAddForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Reminder title"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Description</label>
                <Textarea className='text-white'
                  value={addForm.description}
                  onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Category</label>
                <div className="relative">
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/90 border border-[#EFE8D8] rounded-lg text-[#3A2F2F] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/50 focus:border-[#D2B193] appearance-none cursor-pointer"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#7A6F6F] pointer-events-none" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`w-3 h-3 rounded-full ${categoryOptions.find(opt => opt.value === addForm.category)?.color}`}></div>
                  <span className="text-xs text-gray-400">Selected category color</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Date</label>
                  <Input
                    type="date"
                    value={addForm.date}
                    onChange={(e) => setAddForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Time</label>
                  <Input
                    type="time"
                    value={addForm.time}
                    onChange={(e) => setAddForm(prev => ({ ...prev, time: e.target.value }))}
                    disabled={addForm.allDay}
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="add-all-day"
                  checked={addForm.allDay}
                  onChange={(e) => setAddForm(prev => ({ ...prev, allDay: e.target.checked }))}
                  className="rounded border-[#EFE8D8]"
                />
                <label htmlFor="add-all-day" className="text-sm text-gray-300">All day event</label>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowAddModal(false)
                    setAddForm({ title: '', description: '', date: new Date().toISOString().slice(0,10), time: '09:00', allDay: false, category: 'reminder' })
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={async () => {
                    try {
                      const startsAt = addForm.allDay 
                        ? new Date(`${addForm.date}T00:00:00`) 
                        : new Date(`${addForm.date}T${addForm.time}:00`)
                      
                      const res = await fetch('/api/calendar/reminders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          title: addForm.title, 
                          description: addForm.description || undefined,
                          category: addForm.category,
                          startsAt 
                        }),
                      })
                      
                      if (!res.ok) throw new Error('Create failed')
                      
                      // Reset form and close modal
                      setAddForm({ title: '', description: '', date: new Date().toISOString().slice(0,10), time: '09:00', allDay: false, category: 'reminder' })
                      setShowAddModal(false)
                      
                      // Reload events
                      const params = new URLSearchParams({ start: range.start.toISOString(), end: range.end.toISOString() })
                      const eventsRes = await fetch(`/api/calendar/events?${params.toString()}`)
                      if (eventsRes.ok) {
                        const json = await eventsRes.json()
                        setEvents(json.events ?? [])
                      }
                    } catch (err) {
                      console.error(err)
                      alert('Failed to create reminder')
                    }
                  }}
                  disabled={!addForm.title.trim()}
                >
                  Add Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {reminderToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card variant="glass" className="max-w-md mx-4">
            <CardHeader>
              <CardTitle className='text-red-300'>Delete Reminder</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 mb-4">Are you sure you want to delete this reminder? This action cannot be undone.</p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setReminderToDelete(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => reminderToDelete && deleteReminder(reminderToDelete)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}