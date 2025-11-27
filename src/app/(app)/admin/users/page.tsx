"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Ban,
  Check,
  Mail,
  Edit,
  Trash2,
  Crown,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  plan: string;
  status: string;
  userType: string;
  lastLoginAt: Date | null;
  createdAt: Date;
  loginCount: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isAdmin, loading: userLoading } = useUser();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  // Redirect non-admin users
  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push("/dashboard");
    }
  }, [userLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    if (!confirm("Are you sure you want to suspend this user?")) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User has been suspended",
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to suspend user",
      });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/activate`, {
        method: "POST",
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User has been activated",
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to activate user",
      });
    }
  };

  const handleChangePlan = async (userId: string, newPlan: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `User plan changed to ${newPlan}`,
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        variant: "error",
        title: "Error",
        description: "Failed to change user plan",
      });
    }
  };

  const handleSendMessage = (user: User) => {
    setSelectedUser(user);
    // Open message modal (to be implemented)
    toast({
      title: "Feature Coming Soon",
      description: "Message functionality will be available soon",
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || user.status.toLowerCase() === filterStatus;

    const matchesPlan =
      filterPlan === "all" || user.plan.toLowerCase() === filterPlan;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: "bg-green-100 text-green-800",
      suspended: "bg-red-100 text-red-800",
      inactive: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusColors[status.toLowerCase() as keyof typeof statusColors]
        }`}
      >
        {status}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const planColors = {
      free: "bg-gray-100 text-gray-800",
      pro: "bg-[#D2B193]/20 text-[#D2B193]",
      enterprise: "bg-purple-100 text-purple-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          planColors[plan.toLowerCase() as keyof typeof planColors]
        }`}
      >
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#2D2424] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B5E5E]">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2D2424]">User Management</h1>
          <p className="text-[#6B5E5E] mt-1">
            Manage all user accounts and permissions
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#2D2424]">{users.length}</p>
          <p className="text-sm text-[#6B5E5E]">Total Users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#6B5E5E]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Plan Filter */}
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
          >
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B5E5E] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B5E5E] uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B5E5E] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B5E5E] uppercase tracking-wider">
                  Logins
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-[#6B5E5E] uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-[#6B5E5E] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D2B193] to-[#B89B7B] flex items-center justify-center overflow-hidden">
                        {user.imageUrl ? (
                          <img
                            src={user.imageUrl}
                            alt={user.email}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#2D2424]">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : "No Name"}
                        </p>
                        <p className="text-sm text-[#6B5E5E]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getPlanBadge(user.plan)}</td>
                  <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#2D2424]">{user.loginCount}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-[#6B5E5E]">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : "Never"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === "ACTIVE" ? (
                        <button
                          onClick={() => handleSuspendUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Suspend User"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivateUser(user.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Activate User"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleSendMessage(user)}
                        className="p-2 text-[#8B6F47] hover:bg-[#E9DCC9]/50 rounded-lg transition-colors"
                        title="Send Message"
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                      <div className="relative group">
                        <button className="p-2 text-[#6B5E5E] hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 hidden group-hover:block z-10">
                          <button
                            onClick={() => handleChangePlan(user.id, "pro")}
                            className="w-full px-4 py-2 text-left text-sm text-[#2D2424] hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Crown className="h-4 w-4" />
                            Change to Pro
                          </button>
                          <button
                            onClick={() =>
                              handleChangePlan(user.id, "enterprise")
                            }
                            className="w-full px-4 py-2 text-left text-sm text-[#2D2424] hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Crown className="h-4 w-4" />
                            Change to Enterprise
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6B5E5E]">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}
