'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign, Activity, BarChart3 } from 'lucide-react';

export default function OwnerAnalyticsPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const mockData = {
    userGrowth: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
      count: Math.floor(Math.random() * 20) + 10
    })),
    revenueGrowth: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0],
      amount: Math.floor(Math.random() * 500) + 200
    })),
    platformUsage: [
      { platform: 'Instagram', count: 45 },
      { platform: 'Facebook', count: 32 },
      { platform: 'LinkedIn', count: 18 },
      { platform: 'Twitter', count: 12 },
    ],
    planDistribution: [
      { plan: 'Free', count: 65 },
      { plan: 'Basic', count: 20 },
      { plan: 'Pro', count: 10 },
      { plan: 'Enterprise', count: 5 },
    ],
    engagement: {
      totalPosts: 1247,
      activeUsers: 87,
      avgPostsPerUser: 14.3,
      contentGenerated: 532,
    },
  };

  const maxUserGrowth = Math.max(...mockData.userGrowth.map(d => d.count));
  const maxRevenue = Math.max(...mockData.revenueGrowth.map(d => d.amount));
  const maxPlatform = Math.max(...mockData.platformUsage.map(p => p.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2626]">Analytics</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">Track performance, trends, and insights</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-[#D2B193] to-[#C4A68A] text-[#2F2626] shadow-lg'
                  : 'bg-[#E9DCC9]/50 text-[#6B5E5E] hover:bg-[#D2B193]/20 border border-[#EADCCE]'
              }`}
            >
              {p === '7d' ? 'Last 7 days' : p === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-5 w-5 text-[#D2B193]" />
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-[#2F2626]">{mockData.engagement.totalPosts.toLocaleString()}</div>
          <div className="text-xs text-[#6B5E5E]">Total Posts</div>
        </div>

        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-[#D2B193]" />
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-[#2F2626]">{mockData.engagement.activeUsers}</div>
          <div className="text-xs text-[#6B5E5E]">Active Users</div>
        </div>

        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-5 w-5 text-[#D2B193]" />
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-[#2F2626]">{mockData.engagement.avgPostsPerUser.toFixed(1)}</div>
          <div className="text-xs text-[#6B5E5E]">Avg Posts/User</div>
        </div>

        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-4 backdrop-blur">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 text-[#D2B193]" />
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-[#2F2626]">{mockData.engagement.contentGenerated}</div>
          <div className="text-xs text-[#6B5E5E]">AI Generated</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
          <h3 className="text-lg font-semibold text-[#2F2626] mb-4">User Growth</h3>
          <div className="h-64 flex items-end gap-1">
            {mockData.userGrowth.slice(-14).map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-[#D2B193] to-[#B89B7B] rounded-t transition-all hover:opacity-80"
                  style={{ height: `${(day.count / maxUserGrowth) * 100}%` }}
                  title={`${day.count} users`}
                ></div>
                <span className="text-[10px] text-[#6B5E5E] mt-1">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Growth */}
        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
          <h3 className="text-lg font-semibold text-[#2F2626] mb-4">Revenue Trends</h3>
          <div className="h-64 flex items-end gap-1">
            {mockData.revenueGrowth.slice(-14).map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:opacity-80"
                  style={{ height: `${(day.amount / maxRevenue) * 100}%` }}
                  title={`$${day.amount}`}
                ></div>
                <span className="text-[10px] text-[#6B5E5E] mt-1">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Usage */}
        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
          <h3 className="text-lg font-semibold text-[#2F2626] mb-4">Platform Usage</h3>
          <div className="space-y-4">
            {mockData.platformUsage.map((platform, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#2F2626]">{platform.platform}</span>
                  <span className="text-sm text-[#6B5E5E]">{platform.count} users</span>
                </div>
                <div className="w-full h-2 bg-[#E9DCC9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#D2B193] to-[#B89B7B] transition-all"
                    style={{ width: `${(platform.count / maxPlatform) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
          <h3 className="text-lg font-semibold text-[#2F2626] mb-4">Plan Distribution</h3>
          <div className="space-y-4">
            {mockData.planDistribution.map((plan, i) => {
              const total = mockData.planDistribution.reduce((sum, p) => sum + p.count, 0);
              const percentage = (plan.count / total) * 100;
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-[#2F2626]">{plan.plan}</span>
                    <span className="text-sm text-[#6B5E5E]">{plan.count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#E9DCC9] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
