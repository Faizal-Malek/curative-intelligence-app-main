'use client';

import { useEffect, useState } from 'react';
import OwnerNavbar from '@/components/layout/OwnerNavbar';
import {
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  suspendedUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  overduePayments: number;
  paidUsers: number;
  totalPosts: number;
  pendingTickets: number;
  resolvedTickets: number;
  userGrowth: number; // percentage
  revenueGrowth: number; // percentage
}

interface RecentActivity {
  id: string;
  action: string;
  description: string;
  createdAt: string;
  userId: string;
}

interface OverdueUser {
  id: string;
  name: string;
  email: string;
  nextPaymentDue: string;
  daysOverdue: number;
}

export default function OwnerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [overdueUsers, setOverdueUsers] = useState<OverdueUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/owner/dashboard/overview?activityLimit=10&overdueLimit=16', {
        cache: 'no-store',
      });
      const payload = await response.json();

      if (payload.stats) {
        setStats(payload.stats);
      }
      setRecentActivity(payload.activityLogs || payload.logs || []);
      setOverdueUsers(payload.overdueUsers || payload.users || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-600 mt-2">Welcome back! Here's what's happening with your platform.</p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <Card className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalUsers}</p>
                <div className="flex items-center mt-2 text-sm">
                  {stats.userGrowth >= 0 ? (
                    <>
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">+{stats.userGrowth}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-600 font-medium">{stats.userGrowth}%</span>
                    </>
                  )}
                  <span className="text-slate-500 ml-1">this month</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Revenue */}
          <Card className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">${stats.monthlyRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2 text-sm">
                  {stats.revenueGrowth >= 0 ? (
                    <>
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">+{stats.revenueGrowth}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-600 font-medium">{stats.revenueGrowth}%</span>
                    </>
                  )}
                  <span className="text-slate-500 ml-1">vs last month</span>
                </div>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Active Users */}
          <Card className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Users</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.activeUsers}</p>
                <p className="text-sm text-slate-500 mt-2">
                  {stats.suspendedUsers} suspended
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Pending Tickets */}
          <Card className="p-6 bg-white border-slate-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Support Tickets</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.pendingTickets}</p>
                <p className="text-sm text-slate-500 mt-2">
                  {stats.resolvedTickets} resolved today
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Overdue Payments */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overdue Payments Alert */}
            {overdueUsers.length > 0 && (
              <Card className="p-6 bg-red-50 border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <div>
                      <h2 className="text-lg font-bold text-red-900">Overdue Payments</h2>
                      <p className="text-sm text-red-600">{overdueUsers.length} users need payment reminders</p>
                    </div>
                  </div>
                  <Link href="/owner/users?filter=overdue">
                    <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                      View All
                    </Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {overdueUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">{user.daysOverdue} days overdue</p>
                        <p className="text-xs text-slate-500">Due: {new Date(user.nextPaymentDue).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recent Activity */}
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                <Link href="/owner/reports">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="h-4 w-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                      <p className="text-sm text-slate-600">{activity.description}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Quick Stats */}
          <div className="space-y-6">
            {/* Payment Status */}
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Payment Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-slate-600">Paid</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{stats.paidUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <span className="text-sm text-slate-600">Overdue</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{stats.overduePayments}</span>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Total Revenue</span>
                    <span className="text-xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Content Stats */}
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Platform Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Posts</span>
                  <span className="text-lg font-bold text-slate-900">{stats.totalPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">New Users</span>
                  <span className="text-lg font-bold text-slate-900">{stats.newUsersThisMonth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Active Today</span>
                  <span className="text-lg font-bold text-slate-900">{stats.activeUsers}</span>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/owner/users">
                  <Button className="w-full justify-start bg-white text-slate-900 hover:bg-slate-50 border border-slate-200">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                </Link>
                <Link href="/owner/analytics">
                  <Button className="w-full justify-start bg-white text-slate-900 hover:bg-slate-50 border border-slate-200">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/owner/support">
                  <Button className="w-full justify-start bg-white text-slate-900 hover:bg-slate-50 border border-slate-200">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Support Tickets
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
