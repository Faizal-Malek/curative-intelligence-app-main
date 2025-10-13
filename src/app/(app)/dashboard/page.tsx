// File Path: src/app/dashboard/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserMenu from "@/components/auth/UserMenu";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { Sparkles, Plus } from "lucide-react";

// New icon components (fallback emoji to avoid unused imports)
const DashboardIconNew = () => <span className="text-xl">📊</span>;
const CalendarIconNew = () => <span className="text-xl">🗓️</span>;
const VaultIconNew = () => <span className="text-xl">📦</span>;
const AnalyticsIconNew = () => <span className="text-xl">📈</span>;
const SettingsIconNew = () => <span className="text-xl">⚙️</span>;

// Reusable NavLink for the sidebar
const NavLink = ({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <a href={href} className="flex items-center space-x-3 px-4 py-3 text-[#6B5E5E] rounded-xl hover:bg-[#D2B193] hover:text-white border border-transparent hover:border-[#EFE8D8] transition-colors duration-200">
    {icon}
    <span className="font-medium">{children}</span>
  </a>
);

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('Welcome back!');
  const [stats, setStats] = useState<{ scheduledPosts: number; ideasInVault: number; engagementDelta: number } | null>(null)
  const router = useRouter();

  useEffect(() => {
    // Fetch the personalized welcome message from the new API route
    const fetchWelcomeMessage = async () => {
      try {
        const response = await fetch('/api/user/welcome-message');
        if (response.ok) {
          const data = await response.json();
          setWelcomeMessage(data.message);
        }
      } catch (error) {
        console.error("Failed to fetch welcome message", error);
      }
    };
    fetchWelcomeMessage();

    // Fetch live dashboard stats
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/dashboard/stats')
        if (res.ok) {
          const data = await res.json()
          setStats({ scheduledPosts: data.scheduledPosts, ideasInVault: data.ideasInVault, engagementDelta: data.engagementDelta })
        }
      } catch {}
    }
    fetchStats()
  }, []);

  const handleGenerateContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/content/generate-batch', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to start content generation.' }));
        throw new Error(errorData.message || 'Failed to start content generation.');
      }

      const { batchId } = await response.json();
      router.push(`/plan-review/${batchId}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] font-montserrat text-[#2D2424] relative">
      <LoadingOverlay show={isLoading} label="Generating content" />
      <div className="flex">
        <aside className="w-72 bg-white/90 backdrop-blur border-r border-[#EFE8D8] hidden md:flex flex-col justify-between sticky top-0 h-screen">
          <div>
            <div className="px-6 py-6 flex items-center justify-between border-b border-[#EFE8D8]">
              <h1 className="text-2xl font-bold tracking-tight">Curative</h1>
              <Sparkles className="h-5 w-5 text-[#D2B193]" />
            </div>
            <nav className="space-y-1 p-4">
              <NavLink href="/dashboard" icon={<DashboardIconNew />}>Dashboard</NavLink>
              <NavLink href="/calendar" icon={<CalendarIconNew />}>Calendar</NavLink>
              <NavLink href="/vault" icon={<VaultIconNew />}>Content Vault</NavLink>
              <NavLink href="/analytics" icon={<AnalyticsIconNew />}>Analytics</NavLink>
            </nav>
          </div>
          <nav className="p-4 border-t border-[#EFE8D8]">
            <NavLink href="/settings" icon={<SettingsIconNew />}>Settings</NavLink>
          </nav>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="bg-white/70 backdrop-blur-lg sticky top-0 z-10 border-b border-[#EFE8D8]">
            <div className="container mx-auto px-6">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-tight">{welcomeMessage}</h2>
                  <span className="text-sm text-[#7A6F6F] hidden md:inline">Your content command center</span>
                </div>
                <UserMenu />
              </div>
            </div>
          </header>

          <main className="container mx-auto px-6 py-8">
            {/* Hero / Primary action */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2" variant="glass" isInteractive>
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-3xl font-floreal">Content Dashboard</h2>
                      <p className="mt-2 text-[#6B5E5E]">Ready to spark some creativity? Generate your next batch of content ideas.</p>
                    </div>
                    <Sparkles className="h-6 w-6 text-[#D2B193]" />
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Button onClick={handleGenerateContent} disabled={isLoading} className="px-6">
                      {isLoading ? 'Generating…' : 'Generate New Content Ideas'}
                    </Button>
                    <Button variant="secondary" className="px-6" onClick={() => router.push('/vault')}>
                      <Plus className="h-4 w-4 mr-2" /> Create Post
                    </Button>
                  </div>
                  {error && (
                    <div className="p-4 mt-6 text-[#B42318] bg-[#FEF3F2] border border-[#FEE4E2] rounded-lg">
                      <p><span className="font-semibold">Oops!</span> {error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card variant="solid" isInteractive>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-[#6B5E5E]">Account Status</h3>
                      <p className="text-2xl font-semibold mt-1 text-[#C49B75]">Free</p>
                    </div>
                    <span className="h-5 w-5 text-[#D2B193]">⏰</span>
                  </div>
                  <div className="mt-4 text-sm text-[#6B5E5E]">Upgrade for unlimited generations and scheduling.</div>
                </CardContent>
              </Card>
            </div>

            {/* KPIs */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Scheduled Posts" value={stats ? stats.scheduledPosts : '—'} />
              <StatCard label="Ideas in Vault" value={stats ? stats.ideasInVault : '—'} />
              <StatCard label="Views (Last 7d)" value={stats ? `${stats.engagementDelta}%` : '—'} />
            </div>
          </main>
            {/* Quick actions & Recent activity */}
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2" variant="glass" isInteractive>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <ul className="mt-4 space-y-3">
                    <ActivityItem>3 posts were generated and added to the vault</ActivityItem>
                    <ActivityItem>1 post scheduled for Friday at 10:00</ActivityItem>
                    <ActivityItem>Brand profile updated</ActivityItem>
                  </ul>
                </CardContent>
              </Card>
              <Card variant="solid" isInteractive>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <div className="mt-4 flex flex-col gap-3">
                    <Button variant="secondary" onClick={() => router.push('/onboarding')} className="justify-start">
                      Update Brand Profile
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/calendar')} className="justify-start">
                      Open Calendar
                    </Button>
                    <Button variant="secondary" onClick={() => router.push('/vault')} className="justify-start">
                      Browse Content Vault
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
        </div>
      </div>
    </div>
  );
}
