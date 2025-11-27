'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CreditCard, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export default function OwnerRevenuePage() {
  const [filter, setFilter] = useState<'all' | 'paid' | 'overdue'>('all');

  const mockData = {
    summary: {
      mrr: 4980,
      arr: 59760,
      totalPaid: 12450,
      overdue: 597,
      paidUsers: 25,
      overdueUsers: 3,
    },
    recentPayments: [
      { id: '1', user: 'Acme Corp', email: 'contact@acme.com', amount: 199, plan: 'Enterprise', date: '2025-11-25', status: 'paid' },
      { id: '2', user: 'TechStart Inc', email: 'admin@techstart.io', amount: 79, plan: 'Pro', date: '2025-11-24', status: 'paid' },
      { id: '3', user: 'Creative Studio', email: 'hello@creative.co', amount: 29, plan: 'Basic', date: '2025-11-20', status: 'overdue' },
      { id: '4', user: 'Global Marketing', email: 'finance@global.com', amount: 199, plan: 'Enterprise', date: '2025-11-18', status: 'paid' },
      { id: '5', user: 'Startup Labs', email: 'team@startuplabs.io', amount: 79, plan: 'Pro', date: '2025-11-15', status: 'overdue' },
    ],
    planRevenue: [
      { plan: 'Enterprise', mrr: 2985, users: 15, color: 'from-purple-500 to-purple-400' },
      { plan: 'Pro', mrr: 1185, users: 15, color: 'from-blue-500 to-blue-400' },
      { plan: 'Basic', mrr: 580, users: 20, color: 'from-green-500 to-green-400' },
      { plan: 'Free', mrr: 0, users: 50, color: 'from-gray-400 to-gray-300' },
    ],
  };

  const filteredPayments = mockData.recentPayments.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2626]">Revenue Management</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">Track payments, subscriptions, and financial metrics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="h-5 w-5 text-[#D2B193]" />
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-[#2F2626]">${mockData.summary.mrr.toLocaleString()}</div>
          <div className="text-sm text-[#6B5E5E] mt-1">Monthly Recurring Revenue</div>
          <div className="text-xs text-green-600 mt-2">ARR: ${mockData.summary.arr.toLocaleString()}</div>
        </div>

        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">{mockData.summary.paidUsers} users</span>
          </div>
          <div className="text-3xl font-bold text-[#2F2626]">${mockData.summary.totalPaid.toLocaleString()}</div>
          <div className="text-sm text-[#6B5E5E] mt-1">Total Paid (30 days)</div>
        </div>

        <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">{mockData.summary.overdueUsers} users</span>
          </div>
          <div className="text-3xl font-bold text-orange-600">${mockData.summary.overdue.toLocaleString()}</div>
          <div className="text-sm text-[#6B5E5E] mt-1">Overdue Payments</div>
        </div>
      </div>

      {/* Plan Revenue Breakdown */}
      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
        <h3 className="text-lg font-semibold text-[#2F2626] mb-4">Revenue by Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockData.planRevenue.map((plan, i) => (
            <div key={i} className="p-4 rounded-xl bg-gradient-to-br from-[#F9F5F0] to-white">
              <div className="text-sm font-medium text-[#6B5E5E] mb-1">{plan.plan}</div>
              <div className="text-2xl font-bold text-[#2F2626]">${plan.mrr.toLocaleString()}</div>
              <div className="text-xs text-[#8B6F47] mt-2">{plan.users} users • ${(plan.mrr / (plan.users || 1)).toFixed(0)}/user</div>
              <div className="mt-3 w-full h-1.5 bg-[#E9DCC9] rounded-full overflow-hidden">
                <div className={`h-full bg-gradient-to-r ${plan.color}`} style={{ width: `${(plan.mrr / mockData.summary.mrr) * 100}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments */}
      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 backdrop-blur overflow-hidden">
        <div className="p-6 border-b border-[#E9DCC9]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#2F2626]">Recent Payments</h3>
            <div className="flex gap-2">
              {(['all', 'paid', 'overdue'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize ${
                    filter === f
                      ? 'bg-gradient-to-r from-[#D2B193] to-[#C4A68A] text-[#2F2626] shadow-md'
                      : 'bg-[#E9DCC9]/50 text-[#6B5E5E] hover:bg-[#D2B193]/20'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F9F5F0]">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B5E5E] uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B5E5E] uppercase tracking-wider">Plan</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B5E5E] uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B5E5E] uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-[#6B5E5E] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9DCC9]">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-[#F9F5F0]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-[#2F2626]">{payment.user}</div>
                    <div className="text-xs text-[#6B5E5E]">{payment.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#2F2626]">{payment.plan}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[#2F2626]">${payment.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-[#6B5E5E]">{new Date(payment.date).toLocaleDateString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {payment.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        <XCircle className="h-3 w-3" />
                        Overdue
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
