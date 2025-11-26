"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  UserCheck,
  UserX,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  Shield
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: userLoading } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    newUsersToday: 0,
    totalRevenue: 0,
    openTickets: 0,
    avgSessionTime: "0m",
    mostUsedPlatform: "Instagram",
  });

  const [loading, setLoading] = useState(true);

  // Redirect non-admin users
  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [userLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardStats();
    }
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/dashboard/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      change: `+${stats.newUsersToday} today`,
      href: "/admin/users",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "from-green-500 to-green-600",
      change: "Last 30 days",
      href: "/admin/users?status=active",
    },
    {
      title: "Suspended",
      value: stats.suspendedUsers,
      icon: UserX,
      color: "from-red-500 to-red-600",
      change: "Requires attention",
      href: "/admin/users?status=suspended",
    },
    {
      title: "Revenue (MRR)",
      value: `$${stats.totalRevenue}`,
      icon: DollarSign,
      color: "from-amber-500 to-amber-600",
      change: "+12% this month",
      href: "/admin/revenue",
    },
    {
      title: "Support Tickets",
      value: stats.openTickets,
      icon: MessageSquare,
      color: "from-purple-500 to-purple-600",
      change: "Open tickets",
      href: "/admin/support",
    },
    {
      title: "Avg. Session",
      value: stats.avgSessionTime,
      icon: Activity,
      color: "from-cyan-500 to-cyan-600",
      change: "Per user",
      href: "/admin/analytics",
    },
  ];

  const quickActions = [
    {
      title: "Manage Users",
      description: "View, edit, and manage all user accounts",
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-500",
    },
    {
      title: "Analytics",
      description: "View detailed platform usage analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-green-500",
    },
    {
      title: "Support Tickets",
      description: "Review and respond to user support requests",
      icon: MessageSquare,
      href: "/admin/support",
      color: "bg-purple-500",
    },
    {
      title: "Send Notification",
      description: "Broadcast messages to all or selected users",
      icon: AlertCircle,
      href: "/admin/notifications",
      color: "bg-amber-500",
    },
    {
      title: "System Settings",
      description: "Configure platform settings and features",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-gray-500",
    },
    {
      title: "Security Logs",
      description: "Monitor security events and activity",
      icon: Shield,
      href: "/admin/logs",
      color: "bg-red-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#2D2424] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B5E5E]">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2424]">Admin Dashboard</h1>
          <p className="text-[#6B5E5E] mt-1">
            Manage users, monitor analytics, and control platform settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gradient-to-r from-[#D2B193] to-[#B89B7B] text-white rounded-lg shadow-md">
            <p className="text-xs font-medium">Admin Access</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link
              key={index}
              href={stat.href}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-[#6B5E5E] mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-[#2D2424] mb-2">
                {stat.value}
              </p>
              <p className="text-xs text-[#6B5E5E]">{stat.change}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-[#2D2424] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={index}
                href={action.href}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-lg hover:border-[#D2B193] transition-all duration-300 group"
              >
                <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#2D2424] mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-[#6B5E5E]">{action.description}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-[#2D2424] mb-4">
          Platform Overview
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-[#2D2424]">Most Used Platform</p>
              <p className="text-sm text-[#6B5E5E]">Social media integration</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#2D2424]">
                {stats.mostUsedPlatform}
              </p>
              <p className="text-xs text-[#6B5E5E]">42% of users</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-[#2D2424]">Content Generated</p>
              <p className="text-sm text-[#6B5E5E]">This month</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#2D2424]">1,247</p>
              <p className="text-xs text-green-600">+18% from last month</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-[#2D2424]">Plan Distribution</p>
              <p className="text-sm text-[#6B5E5E]">User subscriptions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-[#6B5E5E]">65%</p>
                <p className="text-xs text-[#6B5E5E]">Free</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#D2B193]">28%</p>
                <p className="text-xs text-[#6B5E5E]">Pro</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#B89B7B]">7%</p>
                <p className="text-xs text-[#6B5E5E]">Enterprise</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
