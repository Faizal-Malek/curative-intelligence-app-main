'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  Edit,
  Eye,
  DollarSign,
  Mail,
  MoreVertical,
  Shield,
  AlertTriangle,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  userType: string;
  plan: string;
  paymentStatus: string;
  status: string;
  role: string;
  lastPaymentDate: string | null;
  nextPaymentDue: string | null;
  lastLoginAt: string | null;
  loginCount: number;
  allowedNavigation: string[];
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPayment, setFilterPayment] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, filterStatus, filterPayment]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/owner/users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((user) => user.status === filterStatus);
    }

    // Payment filter
    if (filterPayment !== 'all') {
      filtered = filtered.filter((user) => user.paymentStatus === filterPayment);
    }

    setFilteredUsers(filtered);
  };

  const updateUserPaymentStatus = async (userId: string, status: string) => {
    try {
      await fetch('/api/owner/users/payment', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, paymentStatus: status }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      await fetch('/api/owner/users/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const updateUserPlan = async (userId: string, plan: string) => {
    try {
      await fetch('/api/owner/users/plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating plan:', error);
    }
  };

  const sendPaymentReminder = async (userId: string) => {
    try {
      await fetch('/api/owner/users/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      alert('Payment reminder sent successfully!');
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  };

  const updateNavigation = async (userId: string, allowedNavigation: string[]) => {
    try {
      await fetch('/api/owner/users/navigation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, allowedNavigation }),
      });
      fetchUsers();
      setShowNavModal(false);
    } catch (error) {
      console.error('Error updating navigation:', error);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    const styles = {
      PAID: 'bg-green-100 text-green-700 border-green-200',
      UNPAID: 'bg-orange-100 text-orange-700 border-orange-200',
      OVERDUE: 'bg-red-100 text-red-700 border-red-200',
      CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return styles[status as keyof typeof styles] || styles.UNPAID;
  };

  const getUserStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-700 border-green-200',
      INACTIVE: 'bg-slate-100 text-slate-700 border-slate-200',
      SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
      DELETED: 'bg-slate-200 text-slate-700 border-slate-300',
    };
    return styles[status as keyof typeof styles] || styles.INACTIVE;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="text-slate-600 mt-2">Manage user accounts, payments, and permissions</p>
      </div>

      {/* Filters & Search */}
      <Card className="p-6 bg-white border-slate-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          {/* Payment Filter */}
          <select
            value={filterPayment}
            onChange={(e) => setFilterPayment(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="all">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
            <span className="font-semibold">{users.length}</span> users
          </p>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Next Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      {user.role === 'OWNER' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 mt-1">
                          <Shield className="h-3 w-3 mr-1" />
                          Owner
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.plan}
                      onChange={(e) => updateUserPlan(user.id, e.target.value)}
                      className="text-sm border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUserStatusBadge(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPaymentStatusBadge(
                        user.paymentStatus
                      )}`}
                    >
                      {user.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {user.nextPaymentDue
                      ? new Date(user.nextPaymentDue).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center space-x-2">
                      {/* Mark as Paid/Unpaid */}
                      {user.paymentStatus !== 'PAID' ? (
                        <Button
                          onClick={() => updateUserPaymentStatus(user.id, 'PAID')}
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-50 border-green-300"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => updateUserPaymentStatus(user.id, 'UNPAID')}
                          size="sm"
                          variant="outline"
                          className="text-orange-600 hover:bg-orange-50 border-orange-300"
                          title="Mark as Unpaid"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Send Payment Reminder */}
                      {user.paymentStatus !== 'PAID' && (
                        <Button
                          onClick={() => sendPaymentReminder(user.id)}
                          size="sm"
                          variant="outline"
                          className="text-blue-600 hover:bg-blue-50 border-blue-300"
                          title="Send Payment Reminder"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Suspend/Activate User */}
                      {user.status !== 'SUSPENDED' ? (
                        <Button
                          onClick={() => updateUserStatus(user.id, 'SUSPENDED')}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50 border-red-300"
                          title="Suspend User"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => updateUserStatus(user.id, 'ACTIVE')}
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:bg-green-50 border-green-300"
                          title="Activate User"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Navigation Settings */}
                      <Button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowNavModal(true);
                        }}
                        size="sm"
                        variant="outline"
                        className="text-purple-600 hover:bg-purple-50 border-purple-300"
                        title="Navigation Settings"
                      >
                        <SettingsIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Navigation Modal */}
      {showNavModal && selectedUser && (
        <NavigationModal
          user={selectedUser}
          onClose={() => setShowNavModal(false)}
          onSave={updateNavigation}
        />
      )}
    </div>
  );
}

function NavigationModal({
  user,
  onClose,
  onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (userId: string, allowedNavigation: string[]) => void;
}) {
  const allNavigationOptions = [
    'dashboard',
    'calendar',
    'vault',
    'analytics',
    'profile',
    'pricing',
    'settings',
    'support',
  ];

  const [selectedNavigation, setSelectedNavigation] = useState<string[]>(
    user.allowedNavigation || allNavigationOptions
  );

  const toggleNavigation = (nav: string) => {
    if (selectedNavigation.includes(nav)) {
      setSelectedNavigation(selectedNavigation.filter((n) => n !== nav));
    } else {
      setSelectedNavigation([...selectedNavigation, nav]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Navigation Permissions</h2>
          <p className="text-sm text-slate-600 mt-1">
            Control what {user.firstName} can access
          </p>
        </div>
        <div className="p-6 space-y-3">
          {allNavigationOptions.map((nav) => (
            <label key={nav} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedNavigation.includes(nav)}
                onChange={() => toggleNavigation(nav)}
                className="h-5 w-5 text-amber-500 rounded focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700 capitalize">{nav}</span>
            </label>
          ))}
        </div>
        <div className="p-6 border-t border-slate-200 flex justify-end space-x-3">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={() => onSave(user.id, selectedNavigation)} className="bg-amber-500 hover:bg-amber-600">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
