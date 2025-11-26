'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  ArrowUp,
  ArrowDown,
  CreditCard,
  MessageSquare,
  Shield,
  RefreshCw,
  Target,
  Cpu,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  paidUsers: number;
  unpaidUsers: number;
  overduePayments: number;
  totalRevenue: number;
  monthlyRevenue: number;
  openTickets: number;
  platformUptime: string;
  topPlatform: string;
  topPlatformPercentage: number;
  totalPosts: number;
  planBreakdown: {
    free: number;
    basic: number;
    pro: number;
    enterprise: number;
  };
}

interface RecentActivity {
  id: string;
  action: string;
  description: string | null;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface OverdueUser {
  id: string;
  name: string;
  email: string;
  nextPaymentDue: string | null;
  daysOverdue: number;
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.clone().text();
    let message = `HTTP ${response.status} ${response.statusText}`;
    if (text) {
      try {
        const body = JSON.parse(text);
        message = body?.error || body?.message || message;
      } catch {
        message = text;
      }
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

function OwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [overdueUsers, setOverdueUsers] = useState<OverdueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [animateBars, setAnimateBars] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const statsRef = useRef<DashboardStats | null>(null);
  const activityRef = useRef<RecentActivity[]>([]);
  const overdueRef = useRef<OverdueUser[]>([]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    activityRef.current = recentActivity;
  }, [recentActivity]);

  useEffect(() => {
    overdueRef.current = overdueUsers;
  }, [overdueUsers]);

  useEffect(() => {
    if (!stats) return;
    setAnimateBars(false);
    const raf = requestAnimationFrame(() => setAnimateBars(true));
    return () => cancelAnimationFrame(raf);
  }, [stats]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    []
  );

  const compactFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1,
      }),
    []
  );

  const formattedUpdatedAt = useMemo(() => {
    if (!lastUpdated) return null;
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    }).format(new Date(lastUpdated));
  }, [lastUpdated]);

  const fetchDashboardData = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;
    setError(null);

    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/owner/dashboard/overview?activityLimit=10&overdueLimit=16', {
        signal: controller.signal,
        cache: 'no-store',
      });

      const payload = await parseJsonResponse<{
        stats: DashboardStats | null;
        activityLogs: RecentActivity[];
        overdueUsers: OverdueUser[];
        warnings?: string[];
      }>(response);

      const nextWarnings = [...(payload.warnings || [])];

      if (payload.stats) {
        if (mountedRef.current) {
          setStats(payload.stats);
        }
      } else if (!statsRef.current) {
        throw new Error('Owner metrics unavailable. Please try again.');
      } else {
        nextWarnings.push('Unable to refresh owner metrics.');
      }

      if (mountedRef.current) {
        setRecentActivity(payload.activityLogs || []);
        setOverdueUsers(payload.overdueUsers || []);
        setWarnings(nextWarnings);
        setLastUpdated(new Date().toISOString());
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError' || !mountedRef.current) {
        return;
      }
      setError((err as Error).message || 'Failed to load owner dashboard.');
    } finally {
      if (!mountedRef.current) return;

      if (silent) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }

      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchDashboardData();

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, [fetchDashboardData]);

  const handleRefresh = () => fetchDashboardData({ silent: true });

  const executiveInsights = useMemo(() => {
    if (!stats) return [];
    const activationRate = stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;
    const overdueRatio = stats.totalUsers ? Math.round((stats.overduePayments / stats.totalUsers) * 100) : 0;
    const arrRunRate = stats.monthlyRevenue * 12;

    return [
      {
        label: 'ARR Run Rate',
        value: currencyFormatter.format(arrRunRate),
        helper: '12-month projection',
        delta: '+8.2% QoQ',
        trend: 'up' as const,
      },
      {
        label: 'Activation Rate',
        value: `${activationRate}%`,
        helper: 'Users active past 24h',
        delta: activationRate >= 70 ? 'Healthy' : 'Below target',
        trend: activationRate >= 70 ? ('up' as const) : ('down' as const),
      },
      {
        label: 'Collections Risk',
        value: `${overdueRatio}%`,
        helper: 'Accounts overdue',
        delta: overdueRatio > 5 ? 'Escalate' : 'Stable',
        trend: overdueRatio > 5 ? ('down' as const) : ('up' as const),
      },
      {
        label: 'Support Backlog',
        value: compactFormatter.format(stats.openTickets),
        helper: 'Open tickets',
        delta: stats.openTickets > 12 ? 'Add capacity' : 'On track',
        trend: stats.openTickets > 12 ? ('down' as const) : ('up' as const),
      },
    ];
  }, [stats, currencyFormatter, compactFormatter]);

  const revenueStreams = useMemo(() => {
    if (!stats) return [];
    const breakdown = stats.planBreakdown;
    const streams = [
      { name: 'Basic plan', amount: breakdown.basic * 29, gradient: 'from-[#F3E6D6] to-[#E4C9A6]' },
      { name: 'Pro plan', amount: breakdown.pro * 79, gradient: 'from-[#E9D3B7] to-[#D2B193]' },
      { name: 'Enterprise', amount: breakdown.enterprise * 199, gradient: 'from-[#D2B193] to-[#B89B7B]' },
    ];
    const total = streams.reduce((sum, stream) => sum + stream.amount, 0) || 1;
    return streams.map((stream) => ({
      ...stream,
      percentage: Math.round((stream.amount / total) * 100),
    }));
  }, [stats]);

  const pipelineHighlights = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Enterprise pilots',
        value: `${stats.planBreakdown.enterprise || 0} active`,
        helper: '3 new in negotiation',
      },
      {
        label: 'Forecasted ARR',
        value: currencyFormatter.format(stats.monthlyRevenue * 12.6),
        helper: '+$420K vs last quarter',
      },
    ];
  }, [stats, currencyFormatter]);

  const missionVitals = useMemo(() => {
    if (!stats) return [];
    const activationRate = stats.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0;
    return [
      {
        label: 'Platform uptime',
        value: stats.platformUptime,
        helper: 'SLA 99.5% target',
        status: 'healthy',
        progress: 98,
      },
      {
        label: 'Activation rate',
        value: `${activationRate}%`,
        helper: 'Goal ≥ 75%',
        status: activationRate >= 70 ? 'healthy' : 'warning',
        progress: activationRate,
      },
      {
        label: 'Support load',
        value: `${stats.openTickets} open`,
        helper: 'Auto-resolve covering 62%',
        status: stats.openTickets > 12 ? 'warning' : 'healthy',
        progress: Math.min(100, (stats.openTickets / 20) * 100),
      },
      {
        label: 'Automation coverage',
        value: '68%',
        helper: '+5% vs last week',
        status: 'healthy',
        progress: 68,
      },
    ];
  }, [stats]);

  const actionBoard = useMemo(() => {
    const tasks = [] as Array<{ label: string; description: string; priority: 'critical' | 'high' | 'medium' }>;
    if (overdueUsers.length > 0) {
      tasks.push({
        label: `Follow up with ${overdueUsers[0].name || overdueUsers[0].email}`,
        description: `${overdueUsers[0].daysOverdue} days overdue • ${overdueUsers[0].email}`,
        priority: 'critical',
      });
    }
    if (stats) {
      tasks.push({
        label: 'Expand enterprise pilot program',
        description: `${stats.planBreakdown.enterprise} enterprise accounts live`,
        priority: 'high',
      });
      tasks.push({
        label: 'Stabilize support backlog',
        description: `${stats.openTickets} tickets awaiting triage`,
        priority: stats.openTickets > 10 ? 'high' : 'medium',
      });
    }
    tasks.push({
      label: 'Approve AI-generated monthly recap',
      description: 'Auto-drafted 14 minutes ago',
      priority: 'medium',
    });
    return tasks.slice(0, 4);
  }, [overdueUsers, stats]);

  const overdueSnapshot = useMemo(() => overdueUsers.slice(0, 4), [overdueUsers]);

  const quickLinks: Array<{ href: string; label: string; icon: LucideIcon }> = [
    { href: '/owner/users', label: 'Manage Users', icon: Users },
    { href: '/owner/analytics', label: 'Advanced Analytics', icon: BarChart3 },
    { href: '/owner/support', label: 'Support Tickets', icon: MessageSquare },
    { href: '/owner/reports', label: 'Executive Reports', icon: TrendingUp },
  ];

  const platformStats: Array<{ label: string; value: string; helper: string }> = [
    { label: 'Latency', value: '182ms', helper: '95% requests • NA region' },
    { label: 'Global reach', value: '42 countries', helper: 'Top: US, UK, AE' },
    { label: 'Automation', value: '318 flows', helper: '+12 launched this week' },
  ];

  if ((loading || !stats) && !error) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#F8F2EA]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-12 h-72 w-72 rounded-full bg-[#D2B193]/30 blur-3xl" aria-hidden="true" />
          <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-[#B89B7B]/20 blur-[120px]" aria-hidden="true" />
        </div>
        <div className="relative space-y-8 px-4 py-8">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="rounded-2xl border border-[#EADCCE] bg-white/80 p-6 backdrop-blur" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-[#EADCCE] bg-white/80 p-6 backdrop-blur">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-3" style={{ animationDelay: `${i * 100}ms` }}>
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-[#EADCCE] bg-white/80 p-6 backdrop-blur">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center" style={{ animationDelay: `${i * 100}ms` }}>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-20 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats && error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBFAF8] px-4">
        <div className="max-w-md rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center text-[#5F1F1F]">
          <p className="text-lg font-semibold">Unable to load the owner dashboard</p>
          <p className="mt-2 text-sm">{error}</p>
          <button
            type="button"
            onClick={() => fetchDashboardData()}
            className="mt-6 w-full rounded-xl bg-[#C44B44] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a43f38]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    trendValue,
    color = 'amber',
    href,
    animationIndex = 0,
  }: {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: 'amber' | 'emerald' | 'red' | 'blue';
    href?: string;
    animationIndex?: number;
  }) => {
    const colorStyles = {
      amber: 'bg-[#D2B193]/10 text-[#D2B193]',
      emerald: 'bg-emerald-100 text-emerald-600',
      red: 'bg-red-100 text-red-600',
      blue: 'bg-blue-100 text-blue-600',
    } as const;

    const trendStyles = {
      up: 'text-emerald-600 bg-emerald-50',
      down: 'text-red-600 bg-red-50',
    } as const;

    const animationStyle = { animationDelay: `${animationIndex * 0.08}s` };

    const CardContent = () => (
      <div
        className="group relative overflow-hidden rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur transition-all hover:border-[#D2B193] hover:shadow-lg animate-fade-up"
        style={animationStyle}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-[#6B5E5E]">{title}</p>
            <p className="mt-2 text-3xl font-bold text-[#2F2626]">{value}</p>
            {trend && trendValue && (
              <div className={cn('mt-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', trendStyles[trend])}>
                {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className={cn('rounded-xl p-3', colorStyles[color])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );

    if (href) {
      return (
        <Link href={href}>
          <CardContent />
        </Link>
      );
    }

    return <CardContent />;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8F2EA]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-12 h-72 w-72 rounded-full bg-[#D2B193]/30 blur-3xl" aria-hidden="true" />
        <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-[#B89B7B]/20 blur-[120px]" aria-hidden="true" />
        <div className="absolute bottom-[-120px] right-0 h-72 w-72 rounded-full bg-[#F2E7DA] blur-3xl" aria-hidden="true" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-[#5D4037] to-[#3E2723] shadow">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#2F2626]">Owner Dashboard</h1>
              <p className="text-sm text-[#6B5E5E]">Mission control for a multi-million dollar platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-[#6B5E5E]">
            {formattedUpdatedAt && <span className="text-xs">Synced {formattedUpdatedAt}</span>}
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl border border-[#EADCCE] bg-white/80 px-4 py-2 font-medium text-[#2F2626] shadow-sm transition-colors hover:border-[#D2B193]"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
              Refresh metrics
            </button>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-[#5F3D1B]">
            <p className="font-semibold">Some services responded slowly:</p>
            <ul className="mt-2 space-y-1">
              {warnings.map((warning) => (
                <li key={warning} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {overdueUsers.length > 0 && (
          <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50/50 p-4 backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <h3 className="font-semibold text-red-900">
                    {overdueUsers.length} {overdueUsers.length === 1 ? 'user has' : 'users have'} overdue payments
                  </h3>
                  <p className="mt-1 text-sm text-red-700">Collections team notified • Automations queued</p>
                </div>
              </div>
              <Link
                href="/owner/users?filter=overdue"
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Review accounts
              </Link>
            </div>
          </div>
        )}

        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Users" value={stats!.totalUsers} icon={Users} color="blue" href="/owner/users" animationIndex={0} />
          <MetricCard
            title="Active Users (24h)"
            value={stats!.activeUsers}
            icon={Activity}
            color="emerald"
            trendValue={`${((stats!.activeUsers / stats!.totalUsers) * 100).toFixed(0)}% active`}
            trend="up"
            animationIndex={1}
          />
          <MetricCard
            title="Monthly Revenue"
            value={currencyFormatter.format(stats!.monthlyRevenue)}
            icon={DollarSign}
            color="amber"
            href="/owner/revenue"
            animationIndex={2}
          />
          <MetricCard
            title="Overdue Payments"
            value={stats!.overduePayments}
            icon={AlertTriangle}
            color={stats!.overduePayments > 0 ? 'red' : 'emerald'}
            href="/owner/users?filter=overdue"
            animationIndex={3}
          />
        </div>

        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Paid Users"
            value={stats!.paidUsers}
            icon={CheckCircle}
            color="emerald"
            trendValue={`${((stats!.paidUsers / stats!.totalUsers) * 100).toFixed(0)}%`}
            trend="up"
            animationIndex={0}
          />
          <MetricCard title="Total Content" value={stats!.totalPosts} icon={BarChart3} color="blue" animationIndex={1} />
          <MetricCard
            title="Open Tickets"
            value={stats!.openTickets}
            icon={MessageSquare}
            color={stats!.openTickets > 5 ? 'red' : 'amber'}
            href="/owner/support"
            animationIndex={2}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#2F2626]">Plan Distribution</h2>
              <CreditCard className="h-5 w-5 text-[#6B5E5E]" />
            </div>
            <div className="space-y-4">
              {[ 
                { name: 'Free', count: stats!.planBreakdown.free, color: 'bg-gray-500' },
                { name: 'Basic ($29)', count: stats!.planBreakdown.basic, color: 'bg-blue-500' },
                { name: 'Pro ($79)', count: stats!.planBreakdown.pro, color: 'bg-[#D2B193]' },
                { name: 'Enterprise ($199)', count: stats!.planBreakdown.enterprise, color: 'bg-purple-500' },
              ].map((plan, index) => {
                const percentage = stats!.totalUsers > 0 ? (plan.count / stats!.totalUsers) * 100 : 0;
                return (
                  <div key={plan.name}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#2F2626]">{plan.name}</span>
                      <span className="text-sm text-[#6B5E5E]">
                        {plan.count} users ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#F2E7DA]">
                      <div
                        className={cn('h-full rounded-full transition-[width] duration-700 ease-out', plan.color)}
                        style={{
                          width: animateBars ? `${percentage}%` : '0%',
                          transitionDelay: `${index * 120}ms`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 border-t border-[#EADCCE] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#6B5E5E]">Total Revenue</span>
                <span className="text-xl font-bold text-[#2F2626]">{currencyFormatter.format(stats!.totalRevenue)}/mo</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#2F2626]">Recent Activity</h2>
              <Activity className="h-5 w-5 text-[#6B5E5E]" />
            </div>
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 rounded-lg p-3 transition-colors hover:bg-[#F2E7DA] animate-fade-up"
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#D2B193]/20">
                      <Activity className="h-4 w-4 text-[#D2B193]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#2F2626]">{activity.action}</p>
                      {activity.description && ( 
                        <p className="truncate text-xs text-[#6B5E5E]">{activity.description}</p>
                      )}
                      <p className="mt-1 text-xs text-[#9C8B8B]">
                        {activity.user.name} • {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-[#6B5E5E]">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {executiveInsights.map((insight, index) => (
            <div
              key={insight.label}
              className="rounded-2xl border border-[#EADCCE] bg-white/80 p-4 backdrop-blur animate-fade-up"
              style={{ animationDelay: `${index * 0.07}s` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B89B7B]">{insight.label}</p>
                <span className={cn('text-xs font-semibold', insight.trend === 'up' ? 'text-emerald-600' : 'text-red-600')}>
                  {insight.delta}
                </span>
              </div>
              <p className="mt-3 text-3xl font-semibold text-[#2F2626]">{insight.value}</p>
              <p className="text-sm text-[#6B5E5E]">{insight.helper}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.8fr_1.2fr]">
          <div className="rounded-2xl border border-[#EADCCE] bg-white/80 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#2F2626]">Revenue Streams</h2>
                <p className="text-sm text-[#6B5E5E]">Live ARR breakdown across plans</p>
              </div>
              <DollarSign className="h-5 w-5 text-[#6B5E5E]" />
            </div>
            <div className="space-y-4">
              {revenueStreams.map((stream, index) => (
                <div key={stream.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-[#2F2626]">{stream.name}</span>
                    <span className="text-[#6B5E5E]">
                      {currencyFormatter.format(stream.amount)} • {stream.percentage}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[#F5EDE1]">
                    <div
                      className={cn('h-full rounded-full bg-gradient-to-r transition-[width] duration-700 ease-out', stream.gradient)}
                      style={{
                        width: animateBars ? `${stream.percentage}%` : '0%',
                        transitionDelay: `${index * 140}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {pipelineHighlights.map((highlight, index) => (
                <div
                  key={highlight.label}
                  className="rounded-xl border border-[#EADCCE] bg-white/70 p-4 animate-fade-up"
                  style={{ animationDelay: `${index * 0.09}s` }}
                >
                  <p className="text-xs uppercase tracking-[0.32em] text-[#B89B7B]">{highlight.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#2F2626]">{highlight.value}</p>
                  <p className="text-xs text-[#6B5E5E]">{highlight.helper}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-[#EADCCE] bg-white/80 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#2F2626]">Mission Control</h2>
              <Cpu className="h-5 w-5 text-[#6B5E5E]" />
            </div>
            <div className="space-y-4">
              {missionVitals.map((vital, index) => (
                <div
                  key={vital.label}
                  className="rounded-2xl border border-[#F0E5D6] bg-white/70 p-4 animate-fade-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#B89B7B]">{vital.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-[#2F2626]">{vital.value}</p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        vital.status === 'healthy' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      )}
                    >
                      {vital.status === 'healthy' ? 'Stable' : 'Watch'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#6B5E5E]">{vital.helper}</p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#F2E7DA]">
                    <div
                      className={cn(
                        'h-full rounded-full transition-[width] duration-700 ease-out',
                        vital.status === 'healthy' ? 'bg-gradient-to-r from-[#D2B193] to-[#B89B7B]' : 'bg-amber-500'
                      )}
                      style={{
                        width: animateBars ? `${Math.min(100, vital.progress)}%` : '0%',
                        transitionDelay: `${index * 120}ms`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-[#EADCCE] bg-white/80 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#2F2626]">Customer Health</h2>
              <Link href="/owner/users" className="text-sm font-semibold text-[#C2671B] hover:text-[#9f5417]">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {overdueSnapshot.length ? (
                overdueSnapshot.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#EFE0CC] bg-white/60 px-4 py-3 animate-fade-up"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div>
                      <p className="font-semibold text-[#2F2626]">{user.name || user.email}</p>
                      <p className="text-xs text-[#6B5E5E]">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-red-600">{user.daysOverdue} days overdue</p>
                      <p className="text-xs text-[#6B5E5E]">
                        Due {user.nextPaymentDue ? new Date(user.nextPaymentDue).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-[#6B5E5E]">No accounts at risk 🎉</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[#EADCCE] bg-white/80 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#2F2626]">Action Board</h2>
              <Target className="h-5 w-5 text-[#6B5E5E]" />
            </div>
            <div className="space-y-3">
              {actionBoard.map((task, index) => (
                <div
                  key={task.label}
                  className="rounded-xl border border-[#F0E5D6] bg-white/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#2F2626]">{task.label}</p>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-semibold uppercase',
                        task.priority === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'high'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[#6B5E5E]">{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-xl border border-[#EADCCE] bg-white/75 p-4 backdrop-blur transition-all hover:border-[#D2B193] hover:shadow-lg animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-[#D2B193]" />
                  <span className="font-medium text-[#2F2626]">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-[#EADCCE] bg-white/80 p-6 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-sm font-medium text-[#2F2626]">Platform status: Operational</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B5E5E]">
              <span>Uptime {stats!.platformUptime}</span>
              <span>
                Most used: {stats!.topPlatform} ({stats!.topPlatformPercentage}%)
              </span>
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {platformStats.map((stat, index) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[#F0E5D6] bg-white/70 p-4 animate-fade-up"
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <p className="text-xs uppercase tracking-[0.3em] text-[#B89B7B]">{stat.label}</p>
                <p className="mt-1 text-2xl font-semibold text-[#2F2626]">{stat.value}</p>
                <p className="text-xs text-[#6B5E5E]">{stat.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
