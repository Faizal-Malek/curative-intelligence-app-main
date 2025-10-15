'use client';

import { useState, useEffect } from 'react';
import { LayoutDashboard, CalendarDays, Boxes, BarChart3, Settings as SettingsIconLucide, Sparkles, LogOut } from "lucide-react";
import AnimatedCard from '../../../components/ui/AnimatedCard'
import { getMockAnalytics } from '../../../lib/analytics'
import { useToast } from '../../../components/ui/Toast'
import ClientRunButton from './ClientRunButton'
import UserMenu from "@/components/auth/UserMenu";
// removed unused LogOut import

// Navigation icon components (lucide)
const DashboardIconNew = () => <LayoutDashboard className="h-5 w-5" />;
const CalendarIconNew = () => <CalendarDays className="h-5 w-5" />;
const VaultIconNew = () => <Boxes className="h-5 w-5" />;
const AnalyticsIconNew = () => <BarChart3 className="h-5 w-5" />;
const SettingsIconNew = () => <SettingsIconLucide className="h-5 w-5" />;
// VaultIconNew not used

// Reusable NavLink for the sidebar
const NavLink = ({ href, icon, children, isActive = false }: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  isActive?: boolean;
}) => (
  <a 
    href={href} 
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

export default function AnalyticsPage() {
  type AnalyticsShape = {
    metrics?: { id: string; name: string; value: string | number; delta?: string }[];
    topChannels?: { name: string; percent: number }[];
  }

  const [analytics, setAnalytics] = useState<AnalyticsShape | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const data = getMockAnalytics()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
        toast({
          variant: 'error',
          title: 'Error',
          description: 'Failed to load analytics data'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [toast])

  if (loading) {
    return (
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-72 fixed bg-white/90 backdrop-blur border-r border-[#EFE8D8] p-6 flex flex-col">
          <div className="mb-8 flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#5D4037] to-[#3E2723] rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[#2D2424]">Curative</h1>
          </div>
          
          <nav className="space-y-2 flex-1">
            <NavLink href="/dashboard" icon={<DashboardIconNew />}>Dashboard</NavLink>
            <NavLink href="/calendar" icon={<CalendarIconNew />}>Calendar</NavLink>
            <NavLink href="/analytics" icon={<AnalyticsIconNew />} isActive>Analytics</NavLink>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Topbar */}
          <header className="h-16 bg-white/90 backdrop-blur border-b border-[#EFE8D8] px-6 flex items-center justify-end">
            <UserMenu />
          </header>

          {/* Page Content */}
          <div className="flex-1 p-6 bg-gradient-to-br from-[#FAF7F0] via-[#F5F2E8] to-[#EBE5D6]">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#2D2424] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-[#6B5E5E]">Loading analytics...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-white/90 backdrop-blur border-r border-[#EFE8D8] p-6 flex flex-col">
        <div className="mb-8 flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-[#5D4037] to-[#3E2723] rounded-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[#2D2424]">Curative</h1>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavLink href="/dashboard" icon={<DashboardIconNew />}>Dashboard</NavLink>
          <NavLink href="/calendar" icon={<CalendarIconNew />}>Calendar</NavLink>
          <NavLink href="/analytics" icon={<AnalyticsIconNew />} isActive>Analytics</NavLink>
          <NavLink href="/settings" icon={<SettingsIconNew />}>Settings</NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white/90 backdrop-blur border-b border-[#EFE8D8] px-6 flex items-center justify-end">
          <UserMenu />
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 bg-gradient-to-br from-[#FAF7F0] via-[#F5F2E8] to-[#EBE5D6] overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-[#2D2424] mb-2">Analytics Dashboard</h1>
              <p className="text-[#6B5E5E]">Track your content performance and engagement metrics</p>
            </div>

            {/* Analytics Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {analytics?.metrics?.map((m: any) => (
                <AnimatedCard key={m.id} ariaLabel={m.name} className="min-h-[96px] bg-white/90 backdrop-blur border border-[#EFE8D8] rounded-2xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm text-[#6B5E5E]">{m.name}</div>
                      <div className="mt-2 text-2xl font-semibold text-[#2D2424]">{m.value}</div>
                    </div>
                    <div className="text-sm text-green-600 self-start">{m.delta}</div>
                  </div>
                </AnimatedCard>
              ))}
            </div>

            {/* Analytics Charts and Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <AnimatedCard ariaLabel="Engagement chart" className="lg:col-span-2 min-h-[220px] bg-white/90 backdrop-blur border border-[#EFE8D8] rounded-2xl p-6">
                <div className="h-full flex items-center justify-center text-[#6B5E5E]">[Engagement chart placeholder]</div>
              </AnimatedCard>

              <div className="space-y-4">
                <AnimatedCard ariaLabel="Top channels" className="min-h-[120px] bg-white/90 backdrop-blur border border-[#EFE8D8] rounded-2xl p-4">
                  <div className="h-full flex flex-col justify-center gap-3 text-sm">
                    <h3 className="font-semibold text-[#2D2424] mb-2">Top Channels</h3>
                    {analytics?.topChannels?.map((c: any) => (
                      <div key={c.name} className="flex items-center justify-between text-[#6B5E5E]">
                        <div>{c.name}</div>
                        <div className="font-semibold text-[#2D2424]">{c.percent}%</div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>

                <AnimatedCard ariaLabel="Optimisation suggestions" className="min-h-[96px] bg-white/90 backdrop-blur border border-[#EFE8D8] rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-[#6B5E5E]">Optimisation</div>
                      <div className="mt-2 text-base font-semibold text-[#2D2424]">Run recommended fixes</div>
                    </div>
                    <ClientRunButton />
                  </div>
                </AnimatedCard>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
