'use client';

import { useState } from 'react';
import { FileText, Download, Calendar, Users, DollarSign, Activity, TrendingUp, Clock } from 'lucide-react';

type ReportType = 'users' | 'revenue' | 'engagement' | 'content';

export default function OwnerReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('users');
  const [dateRange, setDateRange] = useState('30d');
  const [generating, setGenerating] = useState(false);

  const reportTemplates = [
    {
      id: 'users' as ReportType,
      title: 'User Report',
      description: 'User registrations, activity, and demographics',
      icon: Users,
      color: 'from-blue-500 to-blue-400',
      metrics: ['Total Users', 'New Signups', 'Active Users', 'User Retention'],
    },
    {
      id: 'revenue' as ReportType,
      title: 'Revenue Report',
      description: 'Financial performance, subscriptions, and payments',
      icon: DollarSign,
      color: 'from-green-500 to-green-400',
      metrics: ['MRR', 'ARR', 'Paid Users', 'Revenue Growth'],
    },
    {
      id: 'engagement' as ReportType,
      title: 'Engagement Report',
      description: 'User interactions, sessions, and platform usage',
      icon: Activity,
      color: 'from-purple-500 to-purple-400',
      metrics: ['Total Sessions', 'Avg Session Time', 'Features Used', 'Daily Active'],
    },
    {
      id: 'content' as ReportType,
      title: 'Content Report',
      description: 'Posts generated, published, and performance',
      icon: FileText,
      color: 'from-orange-500 to-orange-400',
      metrics: ['Posts Created', 'AI Generated', 'Published Posts', 'Engagement Rate'],
    },
  ];

  const recentReports = [
    { name: 'Monthly User Report', date: '2025-11-01', size: '2.4 MB', type: 'users' },
    { name: 'Q4 Revenue Summary', date: '2025-10-15', size: '1.8 MB', type: 'revenue' },
    { name: 'Weekly Engagement', date: '2025-11-20', size: '980 KB', type: 'engagement' },
    { name: 'Content Performance Oct', date: '2025-10-31', size: '1.2 MB', type: 'content' },
  ];

  const handleGenerateReport = async () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert(`${reportTemplates.find(r => r.id === selectedReport)?.title} generated successfully!`);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2F2626]">Reports</h1>
          <p className="text-sm text-[#6B5E5E] mt-1">Generate and export platform reports</p>
        </div>
      </div>

      {/* Report Templates */}
      <div>
        <h2 className="text-lg font-semibold text-[#2F2626] mb-4">Select Report Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTemplates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedReport(template.id)}
                className={`p-6 rounded-2xl text-left transition-all border-2 ${
                  selectedReport === template.id
                    ? 'border-[#D2B193] bg-gradient-to-br from-[#F9F5F0] to-[#F3E6D6] shadow-lg'
                    : 'border-[#EADCCE] bg-white/75 hover:border-[#D2B193]/50 hover:shadow-md'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#2F2626] mb-1">{template.title}</h3>
                <p className="text-xs text-[#6B5E5E] mb-3">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.metrics.slice(0, 2).map((metric, i) => (
                    <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-[#F9F5F0] text-[#8B6F47]">
                      {metric}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Generate Report */}
      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 p-6 backdrop-blur">
        <h3 className="text-lg font-semibold text-[#2F2626] mb-4">Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#6B5E5E] mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-[#E9DCC9] bg-white text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6B5E5E] mb-2">Format</label>
            <select className="w-full px-4 py-2.5 rounded-lg border border-[#E9DCC9] bg-white text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20">
              <option value="pdf">PDF</option>
              <option value="csv">CSV</option>
              <option value="xlsx">Excel (XLSX)</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D2B193] to-[#C4A68A] text-[#2F2626] font-semibold hover:shadow-xl hover:from-[#C4A68A] hover:to-[#B89B7B] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="rounded-2xl border border-[#EADCCE] bg-white/75 backdrop-blur overflow-hidden">
        <div className="p-6 border-b border-[#E9DCC9]">
          <h3 className="text-lg font-semibold text-[#2F2626]">Recent Reports</h3>
        </div>
        <div className="divide-y divide-[#E9DCC9]">
          {recentReports.map((report, i) => (
            <div key={i} className="p-4 hover:bg-[#F9F5F0]/50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#D2B193]/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-[#D2B193]" />
                </div>
                <div>
                  <div className="font-medium text-[#2F2626]">{report.name}</div>
                  <div className="text-xs text-[#6B5E5E] mt-0.5">
                    {new Date(report.date).toLocaleDateString()} • {report.size}
                  </div>
                </div>
              </div>
              <button className="p-2 rounded-xl hover:bg-gradient-to-r hover:from-[#D2B193] hover:to-[#C4A68A] text-[#D2B193] hover:text-[#2F2626] transition-all">
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
